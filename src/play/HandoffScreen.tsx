import type { Player } from '../game/players';
import { PlayerChip } from './PlayerChip';

/** Shown between turns so the next player doesn't see the previous guess. */
export function HandoffScreen({
  player,
  roundLabel,
  onReady,
}: {
  player: Player;
  roundLabel: string;
  onReady: () => void;
}) {
  return (
    <section className="handoff panel center" style={{ ['--player-color' as string]: player.color }}>
      <p className="round-label">{roundLabel}</p>
      <p className="handoff-lead">Guess locked in! 🔒</p>
      <h1 className="handoff-title">
        Pass to <PlayerChip player={player} big />
      </h1>
      <p className="muted">No peeking at the screen until it's your turn.</p>
      {/* autoFocus so Enter/Space works straight away on a shared keyboard */}
      <button type="button" className="btn btn-primary btn-big" onClick={onReady} autoFocus>
        I'm {player.name} — ready!
      </button>
    </section>
  );
}
