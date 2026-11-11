import { useMemo } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';
import type L from 'leaflet';
import type { LatLng } from '../types';

/**
 * Lets the user click/tap the map to place a pin and drag it to adjust.
 * Must be rendered inside a react-leaflet MapContainer.
 */
export function PinPlacer({
  value,
  onChange,
  icon,
  title,
}: {
  value: LatLng | null;
  onChange: (pos: LatLng) => void;
  icon: L.DivIcon;
  title: string;
}) {
  useMapEvents({
    click(e) {
      const p = e.latlng.wrap(); // keep longitude within -180..180
      onChange({ lat: p.lat, lng: p.lng });
    },
  });

  const handlers = useMemo(
    () => ({
      dragend(e: L.LeafletEvent) {
        const p = (e.target as L.Marker).getLatLng().wrap();
        onChange({ lat: p.lat, lng: p.lng });
      },
    }),
    [onChange],
  );

  if (!value) return null;
  return (
    <Marker
      position={[value.lat, value.lng]}
      icon={icon}
      draggable
      autoPan
      eventHandlers={handlers}
      title={title}
      alt={title}
      keyboard
    />
  );
}
