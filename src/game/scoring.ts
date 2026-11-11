import type { LatLng } from '../types';

/** Tweak these to change how scoring feels. */
export const MAX_POINTS = 5000;
export const DECAY_KM = 2000;

const EARTH_RADIUS_KM = 6371;
export const KM_PER_MILE = 1.609344;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two points, in kilometres (haversine formula). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Points for a guess `distanceKm` away from the answer. 0 km → 5000, decays smoothly. */
export function pointsForDistance(distanceKm: number): number {
  return Math.round(MAX_POINTS * Math.exp(-Math.max(0, distanceKm) / DECAY_KM));
}

export function kmToMiles(km: number): number {
  return km / KM_PER_MILE;
}
