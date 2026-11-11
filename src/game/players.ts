import { MAX_PLAYERS, MIN_PLAYERS } from '../config';

export interface Player {
  id: string;
  name: string;
  color: string;
}

/**
 * 12 distinct colours, all dark enough for white label text (WCAG AA).
 * Green is avoided because the answer pin is green.
 */
export const PLAYER_COLORS = [
  '#d62828', // red
  '#1d4ed8', // blue
  '#c2410c', // orange
  '#7e22ce', // purple
  '#be185d', // pink
  '#0e7490', // teal
  '#854d0e', // brown
  '#334155', // slate
  '#a21caf', // fuchsia
  '#4d7c0f', // olive
  '#0369a1', // sky
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
