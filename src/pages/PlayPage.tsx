import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { APP_NAME } from '../config';
import type { DistanceUnit } from '../game/format';
import { buildPlayers } from '../game/players';
import { createGame, currentPlayer, currentRound, gameReducer, playerById, type GameAction, type GameState } from '../game/state';
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
  const { prompt: leavePrompt } = useUnsavedChangesWarning(inProgress, {
    title: 'Leave this game?',
    body: "Everyone's scores will be lost. Your saved quiz stays safe.",
    leaveLabel: 'Leave game',
    stayLabel: 'Keep playing',
  });

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

  if (load.status === 'loading') return <p className="on-ground">Loading quiz…</p>;
  if (load.status === 'error') {
    return (
      <section className="postcard-back lone-card">
        <h1 className="display">Can't start this game</h1>
        <p className="lead">{load.message}</p>
        <Link to="/" className="btn btn-primary btn-lg">
          Back to your quizzes
        </Link>
      </section>
    );
  }

  return (
    <>
      {renderScreen()}
      {leavePrompt}
    </>
  );

  function renderScreen() {
    if (!game)
      return (
        quiz && (
          <SetupScreen quiz={quiz} initial={lastSetup} unit={unit} onUnitChange={changeUnit} onStart={start} />
        )
      );

    if (game.phase === 'finished') {
      return (
        <ResultsScreen
          state={game}
          photosById={photosById}
          unit={unit}
          // Same players and settings; photos are reshuffled if shuffle was on.
          onPlayAgain={() => lastSetup && start(lastSetup)}
          onChangePlayers={() => setGame(null)}
        />
      );
    }

    const round = currentRound(game);
    const photo = photosById.get(round.photoId)!;
    const roundNo = game.roundIndex + 1;
    const rounds = game.rounds.length;

    if (game.phase === 'reveal') {
      return (
        <RevealScreen
          key={game.roundIndex}
          state={game}
          photo={photo}
          unit={unit}
          onNext={() => dispatch({ type: 'nextRound' })}
        />
      );
    }

    const player = currentPlayer(game)!;

    if (game.phase === 'handoff') {
      return (
        <HandoffScreen
          player={player}
          previous={playerById(game, round.turnOrder[round.guesses.length - 1])}
          round={roundNo}
          rounds={rounds}
          onReady={() => dispatch({ type: 'ready' })}
        />
      );
    }

    return (
      <GuessScreen
        // New key per turn: fresh map view, no previous pin.
        key={`${game.roundIndex}-${round.guesses.length}`}
        photo={photo}
        round={roundNo}
        rounds={rounds}
        player={player}
        onLock={(guess) => dispatch({ type: 'lockGuess', guess })}
      />
    );
  }
}
