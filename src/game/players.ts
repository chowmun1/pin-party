import { MAX_PLAYERS, MIN_PLAYERS } from '../config';

export interface Player {
  id: string;
  name: string;
  color: string;
}

/**
 * 12 distinct ink colours, each AA (>= 5.2:1) with white label text, spread
 * across the hue wheel so neighbours stay distinguishable across a room.
 * Yellow is reserved for the answer pin and red for the main button, so no
 * player is yellow or red.
 */
export const PLAYER_COLORS = [
  '#1d4e9e', // blue
  '#1f7a3f', // green
  '#b84a00', // orange
  '#6a2c91', // purple
  '#00707a', // teal
  '#b0186b', // magenta
  '#7a4a1e', // brown
  '#3d4a5c', // slate
  '#5c6b00', // olive
  '#8a6100', // gold
  '#4338ca', // indigo
  '#111111', // black
] as const;

export const defaultPlayerName = (index: number) => `Player ${index + 1}`;

export function clampPlayerCount(n: number): number {
  if (!Number.isFinite(n)) return MIN_PLAYERS;
  return Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, Math.round(n)));
}

/** Builds players from (possibly blank) names; blank names get the default. */
export function buildPlayers(names: string[]): Player[] {
  return names.slice(0, MAX_PLAYERS).map((raw, i) => ({
    id: `p${i + 1}`,
    name: raw.trim() || defaultPlayerName(i),
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
  }));
}
