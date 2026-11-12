import { Eye } from 'lucide-react';
import { Postmark } from '../components/Postmark';
import { Stamp } from '../components/Stamp';
import type { Player } from '../game/players';

/** Between turns: addressed to the next player, so nobody sees the previous guess. */
export function HandoffScreen({
  player,
  previous,
  round,
  rounds,
  onReady,
}: {
  player: Player;
  previous?: Player;
  round: number;
  rounds: number;
  onReady: () => void;
}) {
  return (
    <section className="handoff">
      <div className="postcard-back handoff-card">
        <div className="handoff-message">
          <Postmark ring={`Round ${round} of ${rounds}`} center="SENT" className="handoff-postmark" />
          <p className="hand lead">
            {previous ? `${previous.name} has posted a guess.` : 'Guess posted.'} Pass the screen to{' '}
            {player.name}, and no peeking!
          </p>
        </div>
        <div className="handoff-address">
          <Stamp color={player.color} size="lg" tilt={4} className="handoff-stamp">
            <span className="stamp-num" aria-hidden="true">
              {(Array.from(player.name.trim())[0] ?? '?').toUpperCase()}
            </span>
          </Stamp>
          <h1 className="handoff-to">
            <span className="handoff-to-label">To:</span>
            <span className="hand handoff-name">{player.name}</span>
          </h1>
        </div>
      </div>
      {/* autoFocus so Enter/Space works straight away on a shared keyboard */}
      <button type="button" className="btn btn-primary btn-xl" onClick={onReady} autoFocus>
        <Eye aria-hidden="true" />
        I'm {player.name}, show me the photo
      </button>
    </section>
  );
}
