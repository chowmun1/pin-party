import L from 'leaflet';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const PIN_PATH =
  'M18 1C8.6 1 1 8.6 1 18c0 12.4 14.6 26.1 15.9 27.3a1.6 1.6 0 0 0 2.2 0C20.4 44.1 35 30.4 35 18 35 8.6 27.4 1 18 1z';
const STAR_PATH = 'M18 9.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z';

export const ANSWER_COLOR = '#ffc93c';
const INK = '#1a1a2e';

/** Pins grow with the root font size, so they stay readable on a TV. */
export function pinScale(): number {
  if (typeof document === 'undefined') return 1;
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return Math.min(1.6, Math.max(1, root / 17));
}

/**
 * A map pin as a Leaflet DivIcon (avoids Leaflet's default PNG icons, which
 * break with bundlers). `label` is shown under the pin so colour is never
 * the only way to tell pins apart.
 */
export function pinIcon(opts: {
  color: string;
  label?: string;
  variant?: 'player' | 'answer';
  /** Extra class on the marker element, e.g. for drop animation. */
  className?: string;
}): L.DivIcon {
  const { color, label, variant = 'player', className = '' } = opts;
  const k = pinScale();
  const w = Math.round(36 * k);
  const h = Math.round(47 * k);
  const box = Math.max(w, 44); // touch target at least 44px wide
  const answer = variant === 'answer';
  const inner = answer
    ? `<path d="${STAR_PATH}" fill="${INK}"/>`
    : `<circle cx="18" cy="18" r="6.5" fill="#fff"/>`;
  const labelHtml = label
    ? `<span class="pin-label${answer ? ' pin-label-answer' : ''}" style="--pin-color:${color}">${escapeHtml(label)}</span>`
    : '';
  return L.divIcon({
    className: `pin-icon ${className}`.trim(),
    html:
      `<span class="pin-body"><svg width="${w}" height="${h}" viewBox="0 0 36 47" aria-hidden="true">` +
      `<path d="${PIN_PATH}" fill="${color}" stroke="${answer ? INK : '#fff'}" stroke-width="2"/>` +
      inner +
      `</svg></span>${labelHtml}`,
    iconSize: [box, h],
    iconAnchor: [box / 2, h - 1],
    popupAnchor: [0, -h],
  });
}

/** Rendered pin size in px (matches pinIcon). */
export function pinSize(): { w: number; h: number } {
  const k = pinScale();
  return { w: Math.round(36 * k), h: Math.round(47 * k) };
}

export function answerIcon(label = 'Answer', className?: string): L.DivIcon {
  return pinIcon({ color: ANSWER_COLOR, label, variant: 'answer', className });
}
