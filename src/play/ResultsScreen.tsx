import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Home, RotateCcw, Star, Users } from 'lucide-react';
import { Stamp } from '../components/Stamp';
import { formatDistance, formatPoints, type DistanceUnit } from '../game/format';
import { MAX_POINTS } from '../game/scoring';
import { roundBreakdown, standings, winners, type GameState } from '../game/state';
import { usePrefersReducedMotion } from '../hooks/motion';
import { useObjectUrl } from '../hooks/useObjectUrl';
import type { Photo } from '../types';
import { PlayerChip } from './PlayerChip';

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
  onPlayAgain,
  onChangePlayers,
}: {
  state: GameState;
  photosById: Map<string, Photo>;
  unit: DistanceUnit;
  onPlayAgain: () => void;
  onChangePlayers: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const table = standings(state);
  const top = winners(state);
  const breakdown = roundBreakdown(state);
  const solo = state.players.length === 1;
  const tie = top.length > 1;
  const maxTotal = state.rounds.length * MAX_POINTS;

  const nearestPerRound = state.rounds.map((r) => Math.min(...r.guesses.map((g) => g.distanceKm)));
  const rankCounts = new Map<number, number>();
  table.forEach((s) => rankCounts.set(s.rank, (rankCounts.get(s.rank) ?? 0) + 1));

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  let headline: string;
  if (solo) headline = `You scored ${formatPoints(table[0].total)}`;
  else if (tie) headline = `${joinNames(top.map((w) => w.player.name))} tie for first!`;
  else headline = `${top[0].player.name} wins!`;

  // Show the winner's best round, not just the first photo.
  const winnerId = top[0].player.id;
  let bestIdx = 0;
  state.rounds.forEach((r, i) => {
    const g = r.guesses.find((x) => x.playerId === winnerId);
    const cur = state.rounds[bestIdx].guesses.find((x) => x.playerId === winnerId);
    if (g && (!cur || g.distanceKm < cur.distanceKm)) bestIdx = i;
  });
  const bestRound = state.rounds[bestIdx];
  const bestGuess = bestRound?.guesses.find((x) => x.playerId === winnerId);
  const winnerPhoto = photosById.get(bestRound?.photoId ?? '');
  const bestPlace = winnerPhoto?.answerName?.trim() || `photo ${bestIdx + 1}`;

  return (
    <section className={`results${reduced ? ' is-still' : ''}`}>
      <div className="winner-card">
        <WinnerPhoto photo={winnerPhoto} />
        <div className="winner-text">
          <h1 className="display display-xl winner-headline">{headline}</h1>
          <p className="hand winner-greeting">Greetings from first place, wish you were here!</p>
          <p className="winner-sub">
            {formatPoints(top[0].total)} points out of a possible {formatPoints(maxTotal)}
          </p>
          {bestGuess && (
            <p className="winner-best">
              {solo ? 'Your best' : `${top[0].player.name}'s best`}: {bestPlace}, {formatDistance(bestGuess.distanceKm, unit)}{' '}
              away
            </p>
          )}
        </div>
        {!solo && (
          <span className="winner-stamp" aria-hidden="true">
            {tie ? 'Joint winners' : 'Winner'}
          </span>
        )}
      </div>

      {!solo && (
        <>
          <h2 className="section-title on-ground">Leaderboard</h2>
          <ol className="leaderboard">
            {table.map((s) => {
              const shared = (rankCounts.get(s.rank) ?? 0) > 1;
              const isWinner = s.rank === 1;
              return (
                <li key={s.player.id} className={`leader-row${isWinner ? ' leader-winner' : ''}`}>
                  <Stamp color={isWinner ? 'var(--sun)' : 'var(--ink)'} size="sm" className="leader-rank">
                    <span aria-hidden="true" className="stamp-num">
                      {shared ? '=' : ''}
                      {ordinal(s.rank)}
                    </span>
                    <span className="sr-only">{`${shared ? 'Joint ' : ''}${ordinal(s.rank)} place`}</span>
                  </Stamp>
                  <span className="leader-name">
                    <PlayerChip player={s.player} big />
                  </span>
                  <span className="leader-total">
                    {formatPoints(s.total)} <span className="leader-pts">pts</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}

      <h2 className="section-title on-ground">Your trip</h2>
      <ol className="trip-strip">
        {state.rounds.map((r, i) => (
          <TripCard key={r.photoId} photo={photosById.get(r.photoId)} n={i + 1} />
        ))}
      </ol>

      <div className="results-actions">
        <button type="button" className="btn btn-primary btn-xl" onClick={onPlayAgain} autoFocus>
          <RotateCcw aria-hidden="true" />
          Play again
        </button>
        <button type="button" className="btn btn-on-ground btn-lg" onClick={onChangePlayers}>
          <Users aria-hidden="true" />
          Change players
        </button>
        <Link to="/" className="btn btn-on-ground btn-lg">
          <Home aria-hidden="true" />
          Back to your quizzes
        </Link>
      </div>

      <details className="sheet breakdown-details">
        <summary className="breakdown-summary">
          <ChevronDown className="summary-chevron" aria-hidden="true" />
          <span className="sheet-title">Round by round</span>
          <span className="help">Points and distance for every guess</span>
        </summary>
        <div className="breakdown-wrap" tabIndex={0} role="region" aria-label="Round by round scores (scrolls sideways)">
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
                    const isBest = !!g && !solo && g.distanceKm === nearestPerRound[i];
                    return (
                      <td key={i} className={`num${isBest ? ' best' : ''}`}>
                        {g ? (
                          <>
                            <span className="cell-points">
                              {isBest && (
                                <>
                                  <Star className="best-star" aria-hidden="true" />
                                  <span className="sr-only">Best this round: </span>
                                </>
                              )}
                              {formatPoints(g.points)}
                            </span>
                            <span className="cell-dist">{formatDistance(g.distanceKm, unit)}</span>
                          </>
                        ) : (
                          '–'
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
      </details>
    </section>
  );
}

function WinnerPhoto({ photo }: { photo?: Photo }) {
  const url = useObjectUrl(photo?.imageBlob);
  return <div className="winner-photo">{url && <img src={url} alt="" />}</div>;
}

function TripCard({ photo, n }: { photo?: Photo; n: number }) {
  const url = useObjectUrl(photo?.imageBlob);
  const name = photo?.answerName?.trim();
  return (
    <li className="trip-card">
      <div className="trip-photo">{url && <img src={url} alt="" />}</div>
      <p className="hand trip-name">{name || `Photo ${n}`}</p>
    </li>
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
