import { describe, expect, it } from 'vitest';
import type { Photo } from '../types';
import { unwrapLng } from './format';
import { buildPlayers, clampPlayerCount } from './players';
import {
  createGame,
  currentPlayer,
  gameReducer,
  isLastRound,
  roundBreakdown,
  shuffled,
  standings,
  totalsThroughRound,
  turnOrderForRound,
  winners,
  type GameState,
} from './state';

const photo = (id: string, lat: number, lng: number): Photo => ({ id, imageBlob: new Blob(), lat, lng });
const photos = [photo('a', 0, 0), photo('b', 10, 10), photo('c', -20, 30)];

function seq(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('players', () => {
  it('builds named players with default names and distinct colours', () => {
    const ps = buildPlayers(['Ann', '  ', 'Cy']);
    expect(ps.map((p) => p.name)).toEqual(['Ann', 'Player 2', 'Cy']);
    expect(new Set(ps.map((p) => p.color)).size).toBe(3);
    expect(new Set(buildPlayers(Array(12).fill('')).map((p) => p.color)).size).toBe(12);
  });

  it('clamps player count to 1..12', () => {
    expect(clampPlayerCount(0)).toBe(1);
    expect(clampPlayerCount(99)).toBe(12);
    expect(clampPlayerCount(NaN)).toBe(1);
  });
});

describe('shuffle and turn order', () => {
  it('shuffles without losing items', () => {
    const out = shuffled([1, 2, 3, 4, 5], seq(0.9, 0.1, 0.5, 0.3));
    expect(out.slice().sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('rotates the starting player each round', () => {
    expect(turnOrderForRound(['x', 'y', 'z'], 0, true)).toEqual(['x', 'y', 'z']);
    expect(turnOrderForRound(['x', 'y', 'z'], 1, true)).toEqual(['y', 'z', 'x']);
    expect(turnOrderForRound(['x', 'y', 'z'], 3, true)).toEqual(['x', 'y', 'z']);
    expect(turnOrderForRound(['x', 'y', 'z'], 1, false)).toEqual(['x', 'y', 'z']);
  });
});

describe('game flow', () => {
  const players = buildPlayers(['Ann', 'Bob']);

  it('runs guessing → handoff → guessing → reveal → next round → finished', () => {
    let s: GameState = createGame(photos, players, { shuffle: false });
    expect(s.phase).toBe('guessing');
    expect(currentPlayer(s)?.name).toBe('Ann');

    s = gameReducer(s, { type: 'lockGuess', guess: { lat: 0, lng: 0 } }); // perfect
    expect(s.phase).toBe('handoff');
    expect(currentPlayer(s)?.name).toBe('Bob');

    s = gameReducer(s, { type: 'ready' });
    expect(s.phase).toBe('guessing');

    s = gameReducer(s, { type: 'lockGuess', guess: { lat: 0, lng: 20 } });
    expect(s.phase).toBe('reveal'); // no handoff after the last player
    expect(s.rounds[0].guesses[0].points).toBe(5000);
    expect(s.rounds[0].guesses[1].points).toBeLessThan(5000);

    s = gameReducer(s, { type: 'nextRound' });
    expect(s.roundIndex).toBe(1);
    expect(currentPlayer(s)?.name).toBe('Bob'); // rotated start

    for (let r = 1; r < 3; r++) {
      s = gameReducer(s, { type: 'lockGuess', guess: { lat: 0, lng: 0 } });
      s = gameReducer(s, { type: 'ready' });
      s = gameReducer(s, { type: 'lockGuess', guess: { lat: 0, lng: 0 } });
      if (r === 2) expect(isLastRound(s)).toBe(true);
      s = gameReducer(s, { type: 'nextRound' });
    }
    expect(s.phase).toBe('finished');
  });

  it('ignores actions in the wrong phase', () => {
    const s = createGame(photos, players, { shuffle: false });
    expect(gameReducer(s, { type: 'ready' })).toBe(s);
    expect(gameReducer(s, { type: 'nextRound' })).toBe(s);
    const h = gameReducer(s, { type: 'lockGuess', guess: { lat: 1, lng: 1 } });
    expect(gameReducer(h, { type: 'lockGuess', guess: { lat: 1, lng: 1 } })).toBe(h);
  });

  it('single player goes straight to reveal', () => {
    let s = createGame(photos, buildPlayers(['Solo']), { shuffle: false });
    s = gameReducer(s, { type: 'lockGuess', guess: { lat: 5, lng: 5 } });
    expect(s.phase).toBe('reveal');
  });

  it('shuffles photo order when asked', () => {
    const s = createGame(photos, players, { shuffle: true, random: seq(0) });
    expect(s.rounds.map((r) => r.photoId)).not.toEqual(['a', 'b', 'c']);
    expect(s.rounds.map((r) => r.photoId).sort()).toEqual(['a', 'b', 'c']);
  });
});

describe('totals and standings', () => {
  it('ranks with ties sharing a place', () => {
    const ps = buildPlayers(['Ann', 'Bob', 'Cy']);
    let s = createGame([photo('a', 0, 0)], ps, { shuffle: false, rotateStart: false });
    s = gameReducer(s, { type: 'lockGuess', guess: { lat: 0, lng: 0 } });
    s = gameReducer(s, { type: 'ready' });
    s = gameReducer(s, { type: 'lockGuess', guess: { lat: 0, lng: 0 } });
    s = gameReducer(s, { type: 'ready' });
    s = gameReducer(s, { type: 'lockGuess', guess: { lat: 40, lng: 40 } });

    expect(totalsThroughRound(s, 0)).toMatchObject({ p1: 5000, p2: 5000 });
    const st = standings(s);
    expect(st.map((x) => [x.player.name, x.rank])).toEqual([
      ['Ann', 1],
      ['Bob', 1],
      ['Cy', 3],
    ]);
  });
});

describe('unwrapLng', () => {
  it('takes the short way across the date line', () => {
    expect(unwrapLng(179, -179)).toBe(181);
    expect(unwrapLng(-179, 179)).toBe(-181);
    expect(unwrapLng(10, 20)).toBe(20);
  });
});

describe('winners and breakdown', () => {
  function playAll(guesses: [number, number][][], names: string[]) {
    const ps = buildPlayers(names);
    const pics = guesses.map((_, i) => photo(`r${i}`, 0, 0));
    let s = createGame(pics, ps, { shuffle: false, rotateStart: false });
    for (const round of guesses) {
      round.forEach(([lat, lng], i) => {
        if (i > 0) s = gameReducer(s, { type: 'ready' });
        s = gameReducer(s, { type: 'lockGuess', guess: { lat, lng } });
      });
      s = gameReducer(s, { type: 'nextRound' });
    }
    return s;
  }

  it('finds a single winner', () => {
    const s = playAll([[[0, 0], [30, 30]]], ['Ann', 'Bob']);
    expect(s.phase).toBe('finished');
    expect(winners(s).map((w) => w.player.name)).toEqual(['Ann']);
  });

  it('reports co-winners on a tie', () => {
    const s = playAll([[[0, 0], [0, 0], [50, 50]]], ['Ann', 'Bob', 'Cy']);
    expect(winners(s).map((w) => w.player.name)).toEqual(['Ann', 'Bob']);
  });

  it('builds a per-round breakdown in standings order', () => {
    const s = playAll(
      [
        [[10, 10], [0, 0]],
        [[0, 0], [0, 1]],
      ],
      ['Ann', 'Bob'],
    );
    const b = roundBreakdown(s);
    expect(b[0].player.name).toBe('Bob');
    expect(b[0].guesses).toHaveLength(2);
    expect(b[0].guesses[0]?.points).toBe(5000);
    expect(b[0].total).toBe(b[0].guesses.reduce((t, g) => t + (g?.points ?? 0), 0));
  });
});
