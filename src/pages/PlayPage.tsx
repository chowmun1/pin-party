import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { APP_NAME } from '../config';
import type { DistanceUnit } from '../game/format';
import { buildPlayers } from '../game/players';
import { createGame, currentPlayer, currentRound, gameReducer, type GameAction, type GameState } from '../game/state';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import { friendlyError } from '../lib/errors';
import { readPref, writePref } from '../lib/prefs';
import { GuessScreen } from '../play/GuessScreen';
import { HandoffScreen } from '../play/HandoffScreen';
import { ResultsScreen } from '../play/ResultsScreen';
import { RevealScreen } from '../play/RevealScreen';
import { SetupScreen, type SetupChoice } from '../play/SetupScreen';
import { quizRepository } from '../storage';
import type { Photo, Quiz } from '../types';

type Load = { status: 'loading' } | { status: 'ready'; quiz: Quiz } | { status: 'error'; message: string };

/**
 * Game state lives only in memory: refreshing mid-game resets the game,
 * but saved quizzes are never touched.
 */
export default function PlayPage() {
  const { id = '' } = useParams();
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [game, setGame] = useState<GameState | null>(null);
  const [lastSetup, setLastSetup] = useState<SetupChoice>();
  const [unit, setUnit] = useState<DistanceUnit>(() => readPref('unit', ['km', 'mi'] as const, 'km'));

  const inProgress = !!game && game.phase !== 'finished';
  useUnsavedChangesWarning(inProgress, 'A game is in progress. Leave and lose the scores?');

  useEffect(() => {
    let cancelled = false;
    quizRepository
      .getQuiz(id)
      .then((quiz) => {
        if (cancelled) return;
        if (!quiz) setLoad({ status: 'error', message: "This quiz doesn't exist (it may have been deleted)." });
        else if (quiz.photos.length === 0) setLoad({ status: 'error', message: 'This quiz has no photos yet.' });
        else setLoad({ status: 'ready', quiz });
      })
      .catch((err) => !cancelled && setLoad({ status: 'error', message: friendlyError(err) }));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const quiz = load.status === 'ready' ? load.quiz : null;
  const photosById = useMemo(() => new Map<string, Photo>(quiz?.photos.map((p) => [p.id, p]) ?? []), [quiz]);

  useEffect(() => {
    if (quiz) document.title = `${quiz.title} · ${APP_NAME}`;
  }, [quiz]);

  // Start each new screen scrolled to the top (matters on phones).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [game?.phase, game?.roundIndex]);

  const dispatch = (action: GameAction) => setGame((g) => (g ? gameReducer(g, action) : g));

  function start(choice: SetupChoice) {
    if (!quiz) return;
    setLastSetup(choice);
    setGame(createGame(quiz.photos, buildPlayers(choice.names), { shuffle: choice.shuffle }));
  }

  function changeUnit(u: DistanceUnit) {
    setUnit(u);
    writePref('unit', u);
  }

  if (load.status === 'loading') return <p className="muted">Loading quiz…</p>;
  if (load.status === 'error') {
    return (
      <section className="panel center">
        <h1>Can't start this game</h1>
        <p>{load.message}</p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </section>
    );
  }

  if (!game) return <SetupScreen quiz={load.quiz} initial={lastSetup} onStart={start} />;

  if (game.phase === 'finished') {
    return (
      <ResultsScreen
        state={game}
        photosById={photosById}
        unit={unit}
        onUnitChange={changeUnit}
        // Same players and settings; photos are reshuffled if shuffle was on.
        onPlayAgain={() => lastSetup && start(lastSetup)}
        onChangePlayers={() => setGame(null)}
      />
    );
  }

  const round = currentRound(game);
  const photo = photosById.get(round.photoId)!;
  const roundLabel = `Round ${game.roundIndex + 1} of ${game.rounds.length}`;

  if (game.phase === 'reveal') {
    return (
      <RevealScreen
        key={game.roundIndex}
        state={game}
        photo={photo}
        roundLabel={roundLabel}
        unit={unit}
        onUnitChange={changeUnit}
        onNext={() => dispatch({ type: 'nextRound' })}
      />
    );
  }

  const player = currentPlayer(game)!;

  if (game.phase === 'handoff') {
    return <HandoffScreen player={player} roundLabel={roundLabel} onReady={() => dispatch({ type: 'ready' })} />;
  }

  return (
    <GuessScreen
      // New key per turn: fresh map view, no previous pin.
      key={`${game.roundIndex}-${round.guesses.length}`}
      photo={photo}
      roundLabel={roundLabel}
      player={player}
      onLock={(guess) => dispatch({ type: 'lockGuess', guess })}
    />
  );
}
