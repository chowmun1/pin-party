import { kmToMiles } from './scoring';

export type DistanceUnit = 'km' | 'mi';

export function formatDistance(km: number, unit: DistanceUnit): string {
  const value = unit === 'km' ? km : kmToMiles(km);
  const digits = value < 10 ? 1 : 0;
  return `${value.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })} ${unit}`;
}

export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Shifts `lng` by ±360 so it's within 180° of `refLng`. Used when drawing a
 * line from a guess to the answer so it takes the short way across the
 * date line instead of crossing the whole map.
 */
export function unwrapLng(refLng: number, lng: number): number {
  let out = lng;
  while (out - refLng > 180) out -= 360;
  while (out - refLng < -180) out += 360;
  return out;
}
