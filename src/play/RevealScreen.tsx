import { useEffect, useMemo, useState } from 'react';
import { Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import { ArrowRight, Trophy } from 'lucide-react';
import { Postmark } from '../components/Postmark';
import { Stamp } from '../components/Stamp';
import { formatDistance, formatPoints, unwrapLng, type DistanceUnit } from '../game/format';
import type { Player } from '../game/players';
import { currentRound, isLastRound, playerById, totalsThroughRound, type GameState, type Guess } from '../game/state';
import { useCountUp, usePrefersReducedMotion } from '../hooks/motion';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { BaseMap } from '../map/BaseMap';
import { FitBounds } from '../map/FitBounds';
import { answerIcon, pinIcon, pinSize } from '../map/icons';
import type { Photo } from '../types';
import { PlayerChip } from './PlayerChip';

/** Reveal choreography (ms). Reduced motion shows the final state at once. */
const T = { flip: 150, drop: 650, lines: 950, lineStagger: 150, stamp: 2200, scores: 2500, count: 2600 };

export function RevealScreen({
  state,
  photo,
  unit,
  onNext,
}: {
  state: GameState;
  photo: Photo;
  unit: DistanceUnit;
  onNext: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const round = currentRound(state);
  const { answer } = round;
  const roundNo = state.roundIndex + 1;
  const totals = totalsThroughRound(state, state.roundIndex);
  const solo = state.players.length === 1;
  const last = isLastRound(state);

  const [flipped, setFlipped] = useState(reduced);
  const [stamped, setStamped] = useState(reduced);
  const [scored, setScored] = useState(reduced);
  useEffect(() => {
    if (reduced) {
      setFlipped(true);
      setStamped(true);
      setScored(true);
      return;
    }
    // One beat at a time: the place, the pins, the stamp, then the scores.
    const timers = [
      window.setTimeout(() => setFlipped(true), T.flip),
      window.setTimeout(() => setStamped(true), T.stamp),
      window.setTimeout(() => setScored(true), T.scores),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduced]);

  // Draw each guess on the copy of the world nearest the answer, so lines
  // across the date line take the short way round.
  const pins = useMemo(
    () =>
      round.guesses.map((g) => {
        const player = playerById(state, g.playerId);
        return {
          guess: g,
          player,
          pos: { lat: g.lat, lng: unwrapLng(answer.lng, g.lng) },
          icon: pinIcon({ color: player.color }),
        };
      }),
    [round, state, answer.lng],
  );
  const pinH = useMemo(() => pinSize().h, []);
  const answerPin = useMemo(() => answerIcon('Answer', reduced ? '' : 'pin-drop'), [reduced]);
  const rows = [...pins].sort((a, b) => a.guess.distanceKm - b.guess.distanceKm);
  // Closest is decided by distance (points are rounded and can tie when distances differ).
  const closest = useMemo(() => {
    const nearestKm = Math.min(...pins.map((p) => p.guess.distanceKm));
    return pins.filter((p) => p.guess.distanceKm === nearestKm);
  }, [pins]);
  const place = photo.answerName?.trim();
  // The closest pin(s) get a sun halo once the stamp lands, echoing it onto the map.
  const closestIcons = useMemo(
    () =>
      new Map(
        closest.map((c) => [
          c.player.id,
          pinIcon({ color: c.player.color, className: reduced ? 'pin-closest is-still' : 'pin-closest' }),
        ]),
      ),
    [closest, reduced],
  );

  return (
    <section className={`reveal${reduced ? ' is-still' : ''}${stamped ? ' is-stamped' : ''}${scored ? ' is-scored' : ''}`}>
      <div className="reveal-head">
        <h1 className={`display display-lg reveal-title${flipped ? ' is-shown' : ''}`}>
          {place ? place : 'Here’s where it was'}
        </h1>
      </div>

      <div className="reveal-grid">
        <div className="reveal-side">
          <div className="flip-wrap">
            <FlipCard photo={photo} flipped={flipped} place={place} round={roundNo} rounds={state.rounds.length} />
            <div className={`closest-stamp${stamped ? ' is-stamped' : ''}`} role="status">
              <span className="closest-kind">{solo ? 'Your guess' : closest.length > 1 ? 'Closest · a tie' : 'Closest'}</span>
              {!solo && <span className="closest-name">{closest.map((c) => c.player.name).join(' & ')}</span>}
              <span className="closest-dist">{formatDistance(closest[0]?.guess.distanceKm ?? 0, unit)} away</span>
            </div>
          </div>

          <div className="sheet score-sheet">
            <table className="score-table">
              <caption className="sr-only">Scores for round {roundNo}</caption>
              <thead>
                <tr>
                  <th scope="col">Player</th>
                  <th scope="col" className="num">
                    Distance
                  </th>
                  <th scope="col" className="num">
                    Points
                  </th>
                  <th scope="col" className="num">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ player, guess }, i) => (
                  <ScoreRow
                    key={player.id}
                    player={player}
                    guess={guess}
                    total={totals[player.id] ?? 0}
                    unit={unit}
                    delayMs={T.count + i * 120}
                    instant={reduced}
                  />
                ))}
              </tbody>
            </table>
          </div>

        </div>

        <BaseMap className="map map-reveal" label="Map showing the answer and everyone's guesses">
          {pins.map(({ player, pos }) => (
            <Polyline
              key={`line-${player.id}`}
              positions={[
                [pos.lat, pos.lng],
                [answer.lat, answer.lng],
              ]}
              pathOptions={{
                color: player.color,
                weight: 5,
                opacity: 0.95,
                className: reduced ? 'route-line' : 'route-line route-pending',
              }}
            />
          ))}
          {pins.map(({ player, pos, icon }, i) => {
            const isClosest = !solo && closest.some((c) => c.player.id === player.id);
            return (
              <Marker
                key={player.id}
                position={[pos.lat, pos.lng]}
                icon={isClosest ? closestIcons.get(player.id) ?? icon : icon}
                title={`${player.name}'s guess${isClosest ? ', closest' : ''}`}
                alt={`${player.name}'s guess`}
                keyboard={false}
                zIndexOffset={isClosest ? 500 : 0}
              >
                {/* Tooltips live in a pane above every marker, so no pin can cover a name */}
                <Tooltip
                  permanent
                  direction={i % 2 ? 'top' : 'bottom'}
                  offset={[0, i % 2 ? -(pinH + 2) : 2]}
                  className={`pin-tip${isClosest ? ' pin-tip-closest' : ''}`}
                >
                  <span style={{ background: player.color }} className="pin-tip-label">
                    {player.name}
                  </span>
                </Tooltip>
              </Marker>
            );
          })}
          <Marker
            position={[answer.lat, answer.lng]}
            icon={answerPin}
            zIndexOffset={1000}
            title="Correct location"
            alt="Correct location"
            keyboard={false}
          />
          <FitBounds points={[answer, ...pins.map((p) => p.pos)]} />
          {!reduced && <DrawRoutes />}
        </BaseMap>
      </div>
      {/* Top-right of the reveal on wide screens, last on phones (see .reveal grid areas) */}
      <button type="button" className="btn btn-primary btn-xl reveal-next" onClick={onNext} autoFocus>
        {last ? <Trophy aria-hidden="true" /> : null}
        {last ? 'See who won' : 'Next photo'}
        {!last && <ArrowRight aria-hidden="true" />}
      </button>
    </section>
  );
}

/** The round's postcard: photo on the front, handwritten answer on the back. */
function FlipCard({
  photo,
  flipped,
  place,
  round,
  rounds,
}: {
  photo: Photo;
  flipped: boolean;
  place?: string;
  round: number;
  rounds: number;
}) {
  const url = useObjectUrl(photo.imageBlob);
  return (
    <div className={`flip${flipped ? ' is-flipped' : ''}`}>
      <div className="flip-inner">
        <div className="flip-face flip-front" aria-hidden={flipped}>
          {url && <img src={url} alt="" />}
        </div>
        <div className="flip-face flip-back postcard-back" aria-hidden={!flipped}>
          <div className="flip-back-message">
            <p className="hand flip-greeting">Greetings from</p>
            <p className="hand flip-place">{place || 'right here!'}</p>
            {photo.caption && <p className="hand flip-hint">{photo.caption}</p>}
          </div>
          <div className="flip-back-address">
            <Stamp color="var(--sun)" size="sm" tilt={4} className="flip-stamp">
              <span className="stamp-num" aria-hidden="true">
                {round}
              </span>
            </Stamp>
            <Postmark ring={`Round ${round} of ${rounds}`} center="HERE" className="flip-postmark" />
            <span className="flip-line" />
            <span className="flip-line" />
            <span className="flip-line" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({
  player,
  guess,
  total,
  unit,
  delayMs,
  instant,
}: {
  player: Player;
  guess: Guess;
  total: number;
  unit: DistanceUnit;
  delayMs: number;
  instant: boolean;
}) {
  const points = useCountUp(guess.points, { delayMs, instant });
  const running = useCountUp(total, { delayMs, instant, durationMs: 1100 });
  return (
    <tr>
      <th scope="row">
        <PlayerChip player={player} />
      </th>
      <td className="num">{formatDistance(guess.distanceKm, unit)}</td>
      <td className="num points">
        <span className="sr-only">{formatPoints(guess.points)}</span>
        <span aria-hidden="true">+{formatPoints(points)}</span>
      </td>
      <td className="num">
        <span className="sr-only">{formatPoints(total)}</span>
        <span aria-hidden="true">{formatPoints(running)}</span>
      </td>
    </tr>
  );
}

/** Animates each guess line drawing towards the answer (SVG stroke-dashoffset). */
function DrawRoutes() {
  const map = useMap();
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      map
        .getContainer()
        .querySelectorAll<SVGPathElement>('path.route-line')
        .forEach((p, i) => {
          p.setAttribute('pathLength', '1');
          p.style.setProperty('--draw-delay', `${T.lines + i * T.lineStagger}ms`);
          p.classList.add('is-drawing');
          p.classList.remove('route-pending');
        });
    });
    return () => cancelAnimationFrame(raf);
  }, [map]);
  return null;
}
