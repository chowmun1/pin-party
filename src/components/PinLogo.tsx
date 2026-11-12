export function PinLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path
        d="M32 2C19.3 2 9 12.3 9 25c0 17.2 20.4 34.9 21.3 35.7a2.6 2.6 0 0 0 3.4 0C34.6 59.9 55 42.2 55 25 55 12.3 44.7 2 32 2z"
        fill="var(--red)"
        stroke="#fff"
        strokeWidth="3"
      />
      <circle cx="32" cy="25" r="10" fill="#fff" />
      <circle cx="32" cy="25" r="5.5" fill="var(--sun)" />
    </svg>
  );
}
