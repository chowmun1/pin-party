import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export type MapTarget =
  | { kind: 'point'; lat: number; lng: number; zoom?: number }
  | { kind: 'bounds'; bounds: [number, number, number, number] }; // [s, w, n, e]

/** Flies the map to `target` whenever it changes. Render inside MapContainer. */
export function FlyTo({ target }: { target: MapTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    if (target.kind === 'point') {
      map.flyTo([target.lat, target.lng], target.zoom ?? Math.max(map.getZoom(), 10), { duration: 0.8 });
    } else {
      const [s, w, n, e] = target.bounds;
      map.flyToBounds(
        [
          [s, w],
          [n, e],
        ],
        { duration: 0.8, maxZoom: 14 },
      );
    }
  }, [map, target]);
  return null;
}

/** Leaflet measures its container once; call invalidateSize when layout changes. */
export function InvalidateOnResize() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}
