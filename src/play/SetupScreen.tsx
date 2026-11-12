import { useId, useState } from 'react';
import { Minus, Play, Plus } from 'lucide-react';
import { MAX_PLAYERS, MIN_PLAYERS } from '../config';
import { Stamp } from '../components/Stamp';
import { PLAYER_COLORS, clampPlayerCount, defaultPlayerName } from '../game/players';
import type { DistanceUnit } from '../game/format';
import { MAX_POINTS } from '../game/scoring';
import type { Quiz } from '../types';
import { UnitToggle } from './UnitToggle';

export interface SetupChoice {
  names: string[];
  shuffle: boolean;
}

/** "Who's playing?" laid out like the back of a postcard: message left, addresses right. */
export function SetupScreen({
  quiz,
  initial,
  unit,
  onUnitChange,
  onStart,
}: {
  quiz: Quiz;
  initial?: SetupChoice;
  unit: DistanceUnit;
  onUnitChange: (u: DistanceUnit) => void;
  onStart: (choice: SetupChoice) => void;
}) {
  const [count, setCount] = useState(initial?.names.length ?? 2);
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: MAX_PLAYERS }, (_, i) => initial?.names[i] ?? ''),
  );
  const [shuffle, setShuffle] = useState(initial?.shuffle ?? true);
  const shuffleId = useId();
  const countLabelId = useId();
  const n = quiz.photos.length;

  function start(e: React.FormEvent) {
    e.preventDefault();
    onStart({ names: names.slice(0, count), shuffle });
  }

  return (
    <form className="setup" onSubmit={start}>
      <div className="postcard-back setup-card">
        <div className="setup-message">
          <h1 className="display">{quiz.title}</h1>
          <p className="hand lead">
            {n} photo{n === 1 ? '' : 's'} to guess. Everyone takes a turn to pin where each one was taken, then we
            reveal who was closest.
          </p>
          {quiz.description && <p className="hand">{quiz.description}</p>}
          <p className="setup-scoring">
            Up to {MAX_POINTS.toLocaleString()} points a photo. The closer your pin, the more you score.
          </p>

          <label className="toggle" htmlFor={shuffleId}>
            <input id={shuffleId} type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} />
            <span className="toggle-track" aria-hidden="true" />
            <span>Shuffle the photos</span>
          </label>
          <div className="setup-unit">
            <span className="label">Show distances in</span>
            <UnitToggle unit={unit} onChange={onUnitChange} />
          </div>
        </div>

        <div className="setup-address">
          <div className="setup-count">
            <span className="label" id={countLabelId}>
              Players or teams
            </span>
            <div className="stepper" role="group" aria-labelledby={countLabelId}>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setCount((c) => clampPlayerCount(c - 1))}
                disabled={count <= MIN_PLAYERS}
                aria-label="One fewer player"
              >
                <Minus aria-hidden="true" />
              </button>
              <Stamp color="var(--sun)" size="lg" tilt={-2}>
                <span className="stamp-num" aria-live="polite">
                  {count}
                </span>
              </Stamp>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setCount((c) => clampPlayerCount(c + 1))}
                disabled={count >= MAX_PLAYERS}
                aria-label="One more player"
              >
                <Plus aria-hidden="true" />
              </button>
            </div>
          </div>

          <fieldset className="address-lines">
            <legend className="label">Who's playing?</legend>
            <ol>
              {names.slice(0, count).map((name, i) => (
                <li key={i} className="address-line">
                  <span className="player-dot" style={{ background: PLAYER_COLORS[i] }} aria-hidden="true" />
                  <label className="sr-only" htmlFor={`player-name-${i}`}>
                    Name for player {i + 1}
                  </label>
                  <input
                    id={`player-name-${i}`}
                    className="address-input"
                    value={name}
                    maxLength={24}
                    placeholder={defaultPlayerName(i)}
                    autoComplete="off"
                    onChange={(e) => setNames((all) => all.map((v, j) => (j === i ? e.target.value : v)))}
                  />
                </li>
              ))}
            </ol>
          </fieldset>
        </div>
      </div>

      <div className="setup-actions">
        <button type="submit" className="btn btn-primary btn-xl">
          <Play aria-hidden="true" />
          Start the game
        </button>
      </div>
    </form>
  );
}
