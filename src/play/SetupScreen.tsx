import { useId, useState } from 'react';
import { MAX_PLAYERS, MIN_PLAYERS } from '../config';
import { PLAYER_COLORS, clampPlayerCount, defaultPlayerName } from '../game/players';
import type { Quiz } from '../types';

export interface SetupChoice {
  names: string[];
  shuffle: boolean;
}

export function SetupScreen({
  quiz,
  initial,
  onStart,
}: {
  quiz: Quiz;
  initial?: SetupChoice;
  onStart: (choice: SetupChoice) => void;
}) {
  const [count, setCount] = useState(initial?.names.length ?? 2);
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: MAX_PLAYERS }, (_, i) => initial?.names[i] ?? ''),
  );
  const [shuffle, setShuffle] = useState(initial?.shuffle ?? true);
  const countId = useId();
  const shuffleId = useId();
  const n = quiz.photos.length;

  function start(e: React.FormEvent) {
    e.preventDefault();
    onStart({ names: names.slice(0, count), shuffle });
  }

  return (
    <form className="setup" onSubmit={start}>
      <div className="page-head">
        <div>
          <p className="eyebrow">Game setup</p>
          <h1>{quiz.title}</h1>
          <p className="muted">
            {n} round{n === 1 ? '' : 's'}
            {quiz.description ? ` · ${quiz.description}` : ''}
          </p>
        </div>
      </div>

      <div className="panel">
        <label className="label" htmlFor={countId}>
          How many players or teams?
        </label>
        <div className="stepper">
          <button
            type="button"
            className="icon-btn icon-btn-big"
            onClick={() => setCount((c) => clampPlayerCount(c - 1))}
            disabled={count <= MIN_PLAYERS}
            aria-label="One fewer player"
          >
            −
          </button>
          <select
            id={countId}
            className="input stepper-value"
            value={count}
            onChange={(e) => setCount(clampPlayerCount(Number(e.target.value)))}
          >
            {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="icon-btn icon-btn-big"
            onClick={() => setCount((c) => clampPlayerCount(c + 1))}
            disabled={count >= MAX_PLAYERS}
            aria-label="One more player"
          >
            +
          </button>
        </div>

        <fieldset className="player-fields">
          <legend className="label">Names</legend>
          <ol className="player-name-list">
            {names.slice(0, count).map((name, i) => (
              <li key={i} className="player-name-row">
                <span className="player-dot player-dot-big" style={{ background: PLAYER_COLORS[i] }} aria-hidden />
                <label className="sr-only" htmlFor={`player-name-${i}`}>
                  Name for player {i + 1}
                </label>
                <input
                  id={`player-name-${i}`}
                  className="input"
                  value={name}
                  maxLength={24}
                  placeholder={defaultPlayerName(i)}
                  onChange={(e) =>
                    setNames((all) => all.map((v, j) => (j === i ? e.target.value : v)))
                  }
                />
              </li>
            ))}
          </ol>
        </fieldset>

        <label className="toggle" htmlFor={shuffleId}>
          <input id={shuffleId} type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} />
          <span className="toggle-track" aria-hidden="true" />
          <span>Shuffle photo order</span>
        </label>
      </div>

      <div className="setup-actions">
        <button type="submit" className="btn btn-primary btn-big">
          Start game ▶
        </button>
      </div>
    </form>
  );
}
