import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistance, formatPoints, type DistanceUnit } from '../game/format';
import { roundBreakdown, standings, winners, type GameState } from '../game/state';
import { useObjectUrl } from '../hooks/useObjectUrl';
import type { Photo } from '../types';
import { PlayerChip } from './PlayerChip';
import { UnitToggle } from './UnitToggle';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function ResultsScreen({
  state,
  photosById,
  unit,
  onUnitChange,
  onPlayAgain,
  onChangePlayers,
}: {
  state: GameState;
  photosById: Map<string, Photo>;
  unit: DistanceUnit;
  onUnitChange: (u: DistanceUnit) => void;
  onPlayAgain: () => void;
  onChangePlayers: () => void;
}) {
  const table = standings(state);
  const top = winners(state);
  const breakdown = roundBreakdown(state);
  const solo = state.players.length === 1;
  const tie = top.length > 1;

  // Best points per round, to mark the round winner(s).
  const bestPerRound = state.rounds.map((r) => Math.max(0, ...r.guesses.map((g) => g.points)));
  const rankCounts = new Map<number, number>();
  table.forEach((s) => rankCounts.set(s.rank, (rankCounts.get(s.rank) ?? 0) + 1));

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  let headline: string;
  if (solo) headline = `Final score: ${formatPoints(table[0].total)}`;
  else if (tie) headline = `It's a tie! ${joinNames(top.map((w) => w.player.name))} share first place`;
  else headline = `${top[0].player.name} wins!`;

  return (
    <section className="results">
      <div className="results-hero panel center">
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} style={{ ['--i' as string]: i }} />
          ))}
        </div>
        <p className="results-trophy" aria-hidden="true">
          🏆
        </p>
        <p className="eyebrow">Game over</p>
        <h1 className="results-headline">{headline}</h1>
        {!solo && !tie && (
          <p className="muted">
            with {formatPoints(top[0].total)} points out of a possible{' '}
            {formatPoints(state.rounds.length * 5000)}
          </p>
        )}
      </div>

      {!solo && (
        <>
          <h2 className="section-title">Leaderboard</h2>
          <ol className="leaderboard">
            {table.map((s) => {
              const shared = (rankCounts.get(s.rank) ?? 0) > 1;
              const isWinner = s.rank === 1;
              return (
                <li
                  key={s.player.id}
                  className={`leader-row${isWinner ? ' leader-winner' : ''}`}
                  style={{ ['--player-color' as string]: s.player.color }}
                >
                  <span className="leader-rank">
                    <span aria-hidden="true">
                      {shared ? '=' : ''}
                      {ordinal(s.rank)}
                    </span>
                    <span className="sr-only">{`${shared ? 'Joint ' : ''}${ordinal(s.rank)} place`}</span>
                  </span>
                  <span className="leader-name">
                    <PlayerChip player={s.player} big />
                    {isWinner && <span className="winner-badge">👑 {tie ? 'Joint winner' : 'Winner'}</span>}
                  </span>
                  <span className="leader-total">
                    {formatPoints(s.total)} <span className="muted small">pts</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}

      <div className="page-head breakdown-head">
        <h2 className="section-title">Round by round</h2>
        <UnitToggle unit={unit} onChange={onUnitChange} />
      </div>
      <div className="panel breakdown-wrap" tabIndex={0} role="region" aria-label="Round by round scores (scrollable)">
        <table className="score-table breakdown">
          <caption className="sr-only">
            Points and distance for every player in every round. A star marks the best guess of each round.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="sticky-col">
                Player
              </th>
              {state.rounds.map((r, i) => (
                <th scope="col" key={r.photoId} className="num">
                  <RoundHeader photo={photosById.get(r.photoId)} n={i + 1} />
                </th>
              ))}
              <th scope="col" className="num">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row) => (
              <tr key={row.player.id}>
                <th scope="row" className="sticky-col">
                  <PlayerChip player={row.player} />
                </th>
                {row.guesses.map((g, i) => {
                  const best = !!g && !solo && g.points === bestPerRound[i] && g.points > 0;
                  return (
                    <td key={i} className={`num${best ? ' best' : ''}`}>
                      {g ? (
                        <>
                          <span className="cell-points">
                            {best && (
                              <>
                                <span aria-hidden="true">★ </span>
                                <span className="sr-only">Best this round: </span>
                              </>
                            )}
                            {formatPoints(g.points)}
                          </span>
                          <span className="cell-dist">{formatDistance(g.distanceKm, unit)}</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  );
                })}
                <td className="num total-cell">{formatPoints(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="results-actions">
        <button type="button" className="btn btn-primary btn-big" onClick={onPlayAgain} autoFocus>
          ↻ Play again
        </button>
        <button type="button" className="btn btn-big" onClick={onChangePlayers}>
          Change players
        </button>
        <Link to="/" className="btn btn-big">
          Back to home
        </Link>
      </div>
    </section>
  );
}

function RoundHeader({ photo, n }: { photo?: Photo; n: number }) {
  const url = useObjectUrl(photo?.imageBlob);
  return (
    <span className="round-head">
      {url && <img src={url} alt="" className="round-thumb" />}
      <span aria-hidden="true">R{n}</span>
      <span className="sr-only">Round {n}</span>
    </span>
  );
}
