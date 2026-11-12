import type { CSSProperties, ReactNode } from 'react';

const LIGHT_TOKENS = new Set(['var(--sun)', 'var(--sun-tint)', 'var(--paper)', 'var(--paper-shade)']);

/** Dark ink on light stamps, white on dark ones (hex colours measured by luminance). */
function autoInk(color: string): string {
  if (LIGHT_TOKENS.has(color)) return 'var(--ink)';
  const m = /^#([0-9a-f]{6})$/i.exec(color);
  if (!m) return '#fff';
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // White wins when it gives more contrast than ink (#1a1a2e, luminance ~0.011).
  return (1.05 / (lum + 0.05)) >= ((lum + 0.05) / 0.061) ? '#fff' : 'var(--ink)';
}

/** A perforated postage stamp. Used for round counts, player numbers and badges. */
export function Stamp({
  children,
  color = 'var(--red)',
  tilt = 0,
  size = 'md',
  className = '',
  ink,
}: {
  children: ReactNode;
  color?: string;
  tilt?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Text colour on the stamp; picked automatically from the stamp colour if omitted. */
  ink?: string;
}) {
  return (
    <span className={`stamp-wrap ${className}`.trim()}>
    <span
      className={`stamp stamp-${size}`}
      style={
        {
          '--stamp-color': color,
          '--stamp-ink': ink ?? autoInk(color),
          '--stamp-tilt': `${tilt}deg`,
        } as CSSProperties
      }
    >
      <span className="stamp-inner">{children}</span>
    </span>
    </span>
  );
}
