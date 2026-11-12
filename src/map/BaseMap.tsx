import type { ReactNode, Ref } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';
import { InvalidateOnResize } from './MapControls';
import { tileSource } from './tiles';

export const WORLD_CENTER: LatLngExpression = [20, 0];
export const WORLD_ZOOM = 2;

/** World map (tile source chosen in ./tiles.ts) shared by the editor, gameplay and reveal screens. */
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
        <TileLayer attribution={tileSource.attribution} url={tileSource.url} maxZoom={tileSource.maxZoom} />
        <InvalidateOnResize />
        {children}
      </MapContainer>
    </div>
  );
}
