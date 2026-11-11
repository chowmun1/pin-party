import type { ReactNode, Ref } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';
import { InvalidateOnResize } from './MapControls';

export const WORLD_CENTER: LatLngExpression = [20, 0];
export const WORLD_ZOOM = 2;

/** OpenStreetMap world map shared by the editor, gameplay and reveal screens. */
export function BaseMap({
  center = WORLD_CENTER,
  zoom = WORLD_ZOOM,
  className = 'map',
  label = 'World map',
  mapRef,
  children,
}: {
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
  label?: string;
  /** Gives the parent access to the Leaflet map instance. */
  mapRef?: Ref<LeafletMap>;
  children?: ReactNode;
}) {
  return (
    <div className={className} role="region" aria-label={label}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        minZoom={1}
        worldCopyJump
        keyboard
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <InvalidateOnResize />
        {children}
      </MapContainer>
    </div>
  );
}
