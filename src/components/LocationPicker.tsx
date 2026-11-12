import { useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { Crosshair, LocateFixed } from 'lucide-react';
import { BaseMap } from '../map/BaseMap';
import { answerIcon } from '../map/icons';
import { FlyTo, type MapTarget } from '../map/MapControls';
import { PinPlacer } from '../map/PinPlacer';
import type { LatLng } from '../types';
import { PlaceSearch } from './PlaceSearch';

/** Map + search for choosing a photo's answer location. */
export function LocationPicker({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (pos: LatLng) => void;
}) {
  const mapRef = useRef<LeafletMap>(null);
  const [target, setTarget] = useState<MapTarget | null>(null);
  const icon = useMemo(() => answerIcon('Answer'), []);

  // The map is remounted per photo (via key in the parent), so initial view = this photo's pin.
  const [initial] = useState(() =>
    value ? { center: [value.lat, value.lng] as [number, number], zoom: 6 } : null,
  );

  function pinAtCenter() {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter().wrap();
    onChange({ lat: c.lat, lng: c.lng });
  }

  return (
    <div className="location-picker">
      <PlaceSearch
        onPick={(p) =>
          setTarget(p.bounds ? { kind: 'bounds', bounds: p.bounds } : { kind: 'point', lat: p.lat, lng: p.lng })
        }
      />
      <BaseMap
        mapRef={mapRef}
        className="map map-editor"
        label="Answer location map. Click to place the answer pin."
        {...(initial ?? {})}
      >
        <PinPlacer value={value} onChange={onChange} icon={icon} title="Answer location (drag to adjust)" />
        <FlyTo target={target} />
      </BaseMap>
      <div className="map-footer">
        <span className="help" aria-live="polite">
          {value
            ? 'Location set. Drag the pin to adjust it.'
            : 'Click the map where the photo was taken.'}
        </span>
        <div className="row wrap">
          <button type="button" className="btn btn-secondary" onClick={pinAtCenter}>
            <Crosshair aria-hidden="true" />
            Drop pin at map centre
          </button>
          {value && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setTarget({ kind: 'point', lat: value.lat, lng: value.lng })}
            >
              <LocateFixed aria-hidden="true" />
              Zoom to pin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
