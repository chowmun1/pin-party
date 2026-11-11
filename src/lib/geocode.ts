import type { LatLng } from '../types';

export interface PlaceResult extends LatLng {
  label: string;
  /** [south, west, north, east] if known. */
  bounds?: [number, number, number, number];
}

/**
 * Searches place names with OpenStreetMap's free Nominatim service.
 * Usage policy: max 1 request/second, so only call on explicit submit.
 * https://operations.osmfoundation.org/policies/nominatim/
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const q = query.trim();
  if (!q) return [];
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '6');

  let res: Response;
  try {
    res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new Error('Place search failed. Check your internet connection.');
  }
  if (res.status === 429) throw new Error('Too many searches — wait a few seconds and try again.');
  if (!res.ok) throw new Error(`Place search failed (error ${res.status}).`);

  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  return data.flatMap((item): PlaceResult[] => {
    const lat = Number(item?.lat);
    const lng = Number(item?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
    const bb = Array.isArray(item.boundingbox) ? item.boundingbox.map(Number) : null;
    const bounds =
      bb && bb.length === 4 && bb.every(Number.isFinite)
        ? ([bb[0], bb[2], bb[1], bb[3]] as [number, number, number, number])
        : undefined;
    return [{ lat, lng, label: String(item.display_name ?? q), ...(bounds ? { bounds } : {}) }];
  });
}
