/*
 * Pure game engine: no React, no DOM. The UI dispatches actions to
 * `gameReducer` and reads state through the selectors below.
 */
import type { LatLng, Photo } from '../types';
import type { Player } from './players';
import { haversineKm, pointsForDistance } from './scoring';

export interface Guess extends LatLng {
  playerId: string;
  distanceKm: number;
  points: number;
}

export interface GameRound {
  photoId: string;
  answer: LatLng;
  /** Player ids in the order they guess this round. */
  turnOrder: string[];
  /** Guesses so far, in turn order. */
  guesses: Guess[];
}

export type GamePhase =
  | 'guessing' // current player is placing a pin
  | 'handoff' // "pass to next player" screen
  | 'reveal' // round results
  | 'finished'; // all rounds done

export interface GameState {
  players: Player[];
  rounds: GameRound[];
  roundIndex: number;
  phase: GamePhase;
}

export type GameAction =
  | { type: 'lockGuess'; guess: LatLng }
  | { type: 'ready' }
  | { type: 'nextRound' };

export interface GameOptions {
  shuffle: boolean;
  /** Rotate who guesses first each round, so nobody always goes first. */
  rotateStart?: boolean;
  /** Injectable RNG for tests. */
  random?: () => number;
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Player order for a round; with rotation, round r starts with player r (mod n). */
export function turnOrderForRound(playerIds: string[], roundIndex: number, rotate: boolean): string[] {
  if (!rotate || playerIds.length === 0) return playerIds.slice();
  const k = roundIndex % playerIds.length;
  return [...playerIds.slice(k), ...playerIds.slice(0, k)];
}

export function createGame(photos: readonly Photo[], players: Player[], opts: GameOptions): GameState {
  if (players.length === 0) throw new Error('A game needs at least one player');
  if (photos.length === 0) throw new Error('A game needs at least one photo');
  const ordered = opts.shuffle ? shuffled(photos, opts.random) : photos.slice();
  const ids = players.map((p) => p.id);
  return {
    players,
    roundIndex: 0,
    phase: 'guessing',
    rounds: ordered.map((p, i) => ({
      photoId: p.id,
      answer: { lat: p.lat, lng: p.lng },
      turnOrder: turnOrderForRound(ids, i, opts.rotateStart ?? true),
      guesses: [],
    })),
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const round = state.rounds[state.roundIndex];
  switch (action.type) {
    case 'lockGuess': {
      if (state.phase !== 'guessing') return state;
      const playerId = round.turnOrder[round.guesses.length];
      const distanceKm = haversineKm(action.guess, round.answer);
      const guess: Guess = {
        playerId,
        lat: action.guess.lat,
        lng: action.guess.lng,
        distanceKm,
        points: pointsForDistance(distanceKm),
      };
      const guesses = [...round.guesses, guess];
      const rounds = state.rounds.map((r, i) => (i === state.roundIndex ? { ...r, guesses } : r));
      const everyoneGuessed = guesses.length >= round.turnOrder.length;
      return { ...state, rounds, phase: everyoneGuessed ? 'reveal' : 'handoff' };
    }
    case 'ready':
      return state.phase === 'handoff' ? { ...state, phase: 'guessing' } : state;
    case 'nextRound': {
      if (state.phase !== 'reveal') return state;
      if (state.roundIndex >= state.rounds.length - 1) return { ...state, phase: 'finished' };
      return { ...state, roundIndex: state.roundIndex + 1, phase: 'guessing' };
    }
    default:
      return state;
  }
}

// ---------- selectors ----------

export const currentRound = (s: GameState): GameRound => s.rounds[s.roundIndex];

export const isLastRound = (s: GameState): boolean => s.roundIndex === s.rounds.length - 1;

export function playerById(s: GameState, id: string): Player {
  const p = s.players.find((pl) => pl.id === id);
  if (!p) throw new Error(`Unknown player ${id}`);
  return p;
}

/** Player whose turn it is (during guessing/handoff), or undefined when everyone has guessed. */
export function currentPlayer(s: GameState): Player | undefined {
  const r = currentRound(s);
  const id = r.turnOrder[r.guesses.length];
  return id ? playerById(s, id) : undefined;
}

/** Total points per player over rounds 0..roundIndex (inclusive). */
export function totalsThroughRound(s: GameState, roundIndex: number): Record<string, number> {
  const totals: Record<string, number> = Object.fromEntries(s.players.map((p) => [p.id, 0]));
  for (const r of s.rounds.slice(0, roundIndex + 1)) {
    for (const g of r.guesses) totals[g.playerId] = (totals[g.playerId] ?? 0) + g.points;
  }
  return totals;
}

export interface Standing {
  player: Player;
  total: number;
  /** Competition ranking: ties share a rank (1, 1, 3). */
  rank: number;
}

export function standings(s: GameState, throughRound = s.rounds.length - 1): Standing[] {
  const totals = totalsThroughRound(s, throughRound);
  const sorted = s.players
    .map((player, order) => ({ player, total: totals[player.id] ?? 0, order }))
    .sort((a, b) => b.total - a.total || a.order - b.order);
  return sorted.map((row) => ({
    player: row.player,
    total: row.total,
    rank: 1 + sorted.filter((o) => o.total > row.total).length,
  }));
}

/** Everyone sharing first place (more than one = a tie). */
export function winners(s: GameState): Standing[] {
  return standings(s).filter((x) => x.rank === 1);
}

export interface PlayerBreakdown {
  player: Player;
  /** One entry per round, in play order; undefined if that round wasn't played. */
  guesses: (Guess | undefined)[];
  total: number;
}

/** Per-player, per-round results, in standings order. */
export function roundBreakdown(s: GameState): PlayerBreakdown[] {
  return standings(s).map(({ player, total }) => ({
    player,
    total,
    guesses: s.rounds.map((r) => r.guesses.find((g) => g.playerId === player.id)),
  }));
}
