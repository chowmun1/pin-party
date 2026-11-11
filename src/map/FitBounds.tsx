import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from '../types';

/** Fits the map to show all `points` on mount. Render inside MapContainer. */
export function FitBounds({ points, maxZoom = 12 }: { points: LatLng[]; maxZoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    // Wait a frame so Leaflet knows the container's real size.
    const raf = requestAnimationFrame(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [60, 60], maxZoom, animate: false });
    });
    return () => cancelAnimationFrame(raf);
  }, [map]); // fit once per mount: a reveal's points never change
  return null;
}
