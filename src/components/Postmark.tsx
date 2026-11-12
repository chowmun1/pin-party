import { useId } from 'react';

/**
 * A circular postmark with wavy cancel lines, drawn in SVG.
 * `ring` runs around the circle; `center` sits in the middle.
 */
export function Postmark({
  ring,
  center,
  className = '',
  color = 'currentColor',
}: {
  ring: string;
  center: string;
  className?: string;
  color?: string;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`postmark ${className}`.trim()} viewBox="0 0 220 110" aria-hidden="true" focusable="false">
      <defs>
        <path id={`ring-${id}`} d="M55,55 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
      </defs>
      <g fill="none" stroke={color} strokeWidth="3">
        <circle cx="55" cy="55" r="50" />
        <circle cx="55" cy="55" r="27" />
        {[30, 45, 60, 75].map((y) => (
          <path
            key={y}
            d={`M112 ${y} q12 -8 24 0 t24 0 t24 0 t24 0 t12 0`}
            strokeLinecap="round"
          />
        ))}
      </g>
      <text fill={color} fontSize="11" fontWeight="700" letterSpacing="2">
        <textPath href={`#ring-${id}`} startOffset="0">
          {ring.toUpperCase()}
        </textPath>
      </text>
      <text x="55" y="61" textAnchor="middle" fill={color} fontSize="17" fontWeight="700">
        {center}
      </text>
    </svg>
  );
}
