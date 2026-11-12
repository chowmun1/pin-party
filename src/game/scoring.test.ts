import { describe, expect, it } from 'vitest';
import { haversineKm, kmToMiles, pointsForDistance } from './scoring';

describe('haversineKm', () => {
  it('is zero for the same point', () => {
    expect(haversineKm({ lat: 51.5, lng: -0.12 }, { lat: 51.5, lng: -0.12 })).toBe(0);
  });

  it('matches the known London → Paris distance (~344 km)', () => {
    const d = haversineKm({ lat: 51.5074, lng: -0.1278 }, { lat: 48.8566, lng: 2.3522 });
    expect(d).toBeGreaterThan(340);
    expect(d).toBeLessThan(348);
  });

  it('handles the antimeridian', () => {
    const d = haversineKm({ lat: 0, lng: 179.5 }, { lat: 0, lng: -179.5 });
    expect(d).toBeCloseTo(111.2, 0);
  });

  it('is about half the circumference for antipodes', () => {
    expect(haversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 180 })).toBeCloseTo(20015, -1);
  });
});

describe('pointsForDistance', () => {
  it('gives 5000 for a perfect guess', () => {
    expect(pointsForDistance(0)).toBe(5000);
  });

  it('decays smoothly', () => {
    expect(pointsForDistance(2000)).toBe(Math.round(5000 / Math.E)); // 1839
    expect(pointsForDistance(100)).toBe(4756);
    expect(pointsForDistance(20000)).toBe(0);
  });

  it('never increases with distance', () => {
    let prev = Infinity;
    for (let km = 0; km <= 20000; km += 250) {
      const p = pointsForDistance(km);
      expect(p).toBeLessThanOrEqual(prev);
      prev = p;
    }
  });

  it('treats negative input as zero', () => {
    expect(pointsForDistance(-5)).toBe(5000);
  });
});

describe('kmToMiles', () => {
  it('converts', () => {
    expect(kmToMiles(1.609344)).toBeCloseTo(1);
  });
});
