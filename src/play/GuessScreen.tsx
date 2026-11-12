import { useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { Crosshair, Lock } from 'lucide-react';
import { Stamp } from '../components/Stamp';
import type { Player } from '../game/players';
import { BaseMap } from '../map/BaseMap';
import { pinIcon } from '../map/icons';
import { PinPlacer } from '../map/PinPlacer';
import type { LatLng, Photo } from '../types';
import { PhotoStage } from './PhotoStage';

/**
 * One player's turn. The parent remounts this per turn (via `key`), which
 * resets the map view and clears the pin so nobody sees the previous guess.
 */
export function GuessScreen({
  photo,
  round,
  rounds,
  player,
  onLock,
}: {
  photo: Photo;
  round: number;
  rounds: number;
  player: Player;
  onLock: (guess: LatLng) => void;
}) {
  const [pin, setPin] = useState<LatLng | null>(null);
  const mapRef = useRef<LeafletMap>(null);
  const icon = useMemo(() => pinIcon({ color: player.color, label: player.name }), [player]);
  const roundLabel = `Round ${round} of ${rounds}`;

  function pinAtCenter() {
    const c = mapRef.current?.getCenter().wrap();
    if (c) setPin({ lat: c.lat, lng: c.lng });
  }

  return (
    <section className="play">
      <div className="turn-plate">
        <h1 className="turn-title">
          <span className="turn-to" aria-hidden="true">
            To:
          </span>
          <span className="player-dot player-dot-lg" style={{ background: player.color }} aria-hidden="true" />
          <span className="turn-name hand">{player.name}</span>
          <span className="turn-suffix">your turn</span>
        </h1>
        <Stamp color="var(--sun)" tilt={3} className="round-stamp">
          <span className="sr-only">{roundLabel}</span>
          <span aria-hidden="true" className="stamp-label">
            Round
          </span>
          <span aria-hidden="true" className="stamp-num">
            {round}/{rounds}
          </span>
        </Stamp>
      </div>

      <div className="play-grid">
        <PhotoStage photo={photo} roundLabel={roundLabel} />

        <div className="guess-panel">
          <p className="guess-instruction on-ground" aria-live="polite">
            {pin ? 'Happy with that? Drag the pin to fine-tune it.' : 'Tap the map where you think this photo was taken.'}
          </p>
          <BaseMap mapRef={mapRef} className="map map-play" label={`Guess map for ${player.name}. Click to place your pin.`}>
            <PinPlacer value={pin} onChange={setPin} icon={icon} title={`${player.name}'s guess (drag to adjust)`} />
          </BaseMap>
          <div className="guess-actions">
            <button type="button" className="btn btn-on-ground" onClick={pinAtCenter}>
              <Crosshair aria-hidden="true" />
              Drop pin at map centre
            </button>
            <button type="button" className="btn btn-primary btn-lg" disabled={!pin} onClick={() => pin && onLock(pin)}>
              <Lock aria-hidden="true" />
              Lock in my guess
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
