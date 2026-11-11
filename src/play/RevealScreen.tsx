import { useMemo } from 'react';
import { Marker, Polyline } from 'react-leaflet';
import { formatDistance, formatPoints, unwrapLng, type DistanceUnit } from '../game/format';
import { currentRound, isLastRound, playerById, totalsThroughRound, type GameState } from '../game/state';
import { BaseMap } from '../map/BaseMap';
import { FitBounds } from '../map/FitBounds';
import { answerIcon, pinIcon } from '../map/icons';
import type { Photo } from '../types';
import { PlayerChip } from './PlayerChip';
import { UnitToggle } from './UnitToggle';

export function RevealScreen({
  state,
  photo,
  roundLabel,
  unit,
  onUnitChange,
  onNext,
}: {
  state: GameState;
  photo: Photo;
  roundLabel: string;
  unit: DistanceUnit;
  onUnitChange: (u: DistanceUnit) => void;
  onNext: () => void;
}) {
  const round = currentRound(state);
  const { answer } = round;
  const totals = totalsThroughRound(state, state.roundIndex);

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
          icon: pinIcon({ color: player.color, label: player.name }),
        };
      }),
    [round, state, answer.lng],
  );
  const answerPin = useMemo(() => answerIcon('Answer'), []);
  const rows = [...pins].sort((a, b) => b.guess.points - a.guess.points);
  const last = isLastRound(state);

  return (
    <section className="reveal">
      <div className="page-head">
        <div>
          <p className="round-label">{roundLabel}</p>
          <h1>The answer is…</h1>
          {photo.caption && <p className="muted">💡 {photo.caption}</p>}
        </div>
        <UnitToggle unit={unit} onChange={onUnitChange} />
      </div>

      <div className="reveal-grid">
        <BaseMap className="map map-reveal" label="Map showing the answer and everyone's guesses">
          {pins.map(({ player, pos }) => (
            <Polyline
              key={`line-${player.id}`}
              positions={[
                [pos.lat, pos.lng],
                [answer.lat, answer.lng],
              ]}
              pathOptions={{ color: player.color, weight: 4, dashArray: '8 8', opacity: 0.9 }}
            />
          ))}
          {pins.map(({ player, pos, icon }) => (
            <Marker
              key={player.id}
              position={[pos.lat, pos.lng]}
              icon={icon}
              title={`${player.name}'s guess`}
              alt={`${player.name}'s guess`}
              keyboard={false}
            />
          ))}
          <Marker
            position={[answer.lat, answer.lng]}
            icon={answerPin}
            zIndexOffset={1000}
            title="Correct location"
            alt="Correct location"
            keyboard={false}
          />
          <FitBounds points={[answer, ...pins.map((p) => p.pos)]} />
        </BaseMap>

        <div className="panel reveal-table-wrap">
          <table className="score-table">
            <caption className="sr-only">Results for {roundLabel}</caption>
            <thead>
              <tr>
                <th scope="col">Player</th>
                <th scope="col" className="num">Distance</th>
                <th scope="col" className="num">Points</th>
                <th scope="col" className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ player, guess }) => (
                <tr key={player.id}>
                  <th scope="row">
                    <PlayerChip player={player} />
                  </th>
                  <td className="num">{formatDistance(guess.distanceKm, unit)}</td>
                  <td className="num points">+{formatPoints(guess.points)}</td>
                  <td className="num">{formatPoints(totals[player.id] ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn btn-primary btn-big reveal-next" onClick={onNext} autoFocus>
            {last ? '🏆 See final results' : 'Next round ▶'}
          </button>
        </div>
      </div>
    </section>
  );
}
