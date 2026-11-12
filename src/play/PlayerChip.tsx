import type { Player } from '../game/players';

/** Colour dot + name: colour is never the only cue. */
export function PlayerChip({ player, big }: { player: Player; big?: boolean }) {
  return (
    <span className={`player-chip${big ? ' player-chip-big' : ''}`}>
      <span className="player-dot" style={{ background: player.color }} aria-hidden="true" />
      <span className="player-name">{player.name}</span>
    </span>
  );
}
