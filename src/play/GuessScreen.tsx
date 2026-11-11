import { useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { Player } from '../game/players';
import { BaseMap } from '../map/BaseMap';
import { pinIcon } from '../map/icons';
import { PinPlacer } from '../map/PinPlacer';
import type { LatLng, Photo } from '../types';
import { PhotoStage } from './PhotoStage';
import { PlayerChip } from './PlayerChip';

/**
 * One player's turn. The parent remounts this per turn (via `key`), which
 * resets the map view and clears the pin so nobody sees the previous guess.
 */
export function GuessScreen({
  photo,
  roundLabel,
  player,
  onLock,
}: {
  photo: Photo;
  roundLabel: string;
  player: Player;
  onLock: (guess: LatLng) => void;
}) {
  const [pin, setPin] = useState<LatLng | null>(null);
  const mapRef = useRef<LeafletMap>(null);
  const icon = useMemo(() => pinIcon({ color: player.color, label: player.name }), [player]);

  function pinAtCenter() {
    const c = mapRef.current?.getCenter().wrap();
    if (c) setPin({ lat: c.lat, lng: c.lng });
  }

  return (
    <section className="play">
      <div className="turn-banner" style={{ ['--player-color' as string]: player.color }}>
        <span className="round-label">{roundLabel}</span>
        <h1 className="turn-title">
          <PlayerChip player={player} big />
          <span>’s turn</span>
        </h1>
      </div>

      <div className="play-grid">
        <PhotoStage photo={photo} roundLabel={roundLabel} />

        <div className="guess-panel">
          <BaseMap
            mapRef={mapRef}
            className="map map-play"
            label={`Guess map for ${player.name}. Click to place your pin.`}
          >
            <PinPlacer value={pin} onChange={setPin} icon={icon} title={`${player.name}'s guess (drag to adjust)`} />
          </BaseMap>
          <div className="guess-actions">
            <p className="muted" aria-live="polite">
              {pin ? 'Happy with it? Drag the pin to adjust.' : 'Tap the map where you think this photo was taken.'}
            </p>
            <div className="row wrap">
              <button type="button" className="btn btn-small" onClick={pinAtCenter}>
                Pin at map centre
              </button>
              <button
                type="button"
                className="btn btn-primary btn-big"
                disabled={!pin}
                onClick={() => pin && onLock(pin)}
              >
                🔒 Lock in guess
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
