import L from 'leaflet';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const PIN_PATH =
  'M18 1C8.6 1 1 8.6 1 18c0 12.4 14.6 26.1 15.9 27.3a1.6 1.6 0 0 0 2.2 0C20.4 44.1 35 30.4 35 18 35 8.6 27.4 1 18 1z';

/**
 * A map pin as a Leaflet DivIcon (avoids Leaflet's default PNG icons, which
 * break with bundlers). `label` is shown next to the pin so colour is never
 * the only way to tell pins apart.
 */
export function pinIcon(opts: { color: string; label?: string; glyph?: string }): L.DivIcon {
  const { color, label, glyph } = opts;
  const inner = glyph
    ? `<text x="18" y="23.5" text-anchor="middle" font-size="16" font-weight="700" fill="${color}">${escapeHtml(glyph)}</text>`
    : `<circle cx="18" cy="18" r="6" fill="#fff"/>`;
  const labelHtml = label ? `<span class="pin-label" style="--pin-color:${color}">${escapeHtml(label)}</span>` : '';
  return L.divIcon({
    className: 'pin-icon',
    html:
      `<svg width="36" height="47" viewBox="0 0 36 47" aria-hidden="true">` +
      `<path d="${PIN_PATH}" fill="${color}" stroke="#fff" stroke-width="2"/>` +
      (glyph ? `<circle cx="18" cy="18" r="11" fill="#fff"/>` : '') +
      inner +
      `</svg>${labelHtml}`,
    iconSize: [36, 47],
    iconAnchor: [18, 46],
    popupAnchor: [0, -44],
  });
}

export const ANSWER_COLOR = '#0b8043';

export function answerIcon(label = 'Answer'): L.DivIcon {
  return pinIcon({ color: ANSWER_COLOR, label, glyph: '★' });
}
