import type { DistanceUnit } from '../game/format';

export function UnitToggle({ unit, onChange }: { unit: DistanceUnit; onChange: (u: DistanceUnit) => void }) {
  return (
    <div className="segmented" role="group" aria-label="Distance unit">
      {(['km', 'mi'] as const).map((u) => (
        <button
          key={u}
          type="button"
          className={unit === u ? 'active' : ''}
          aria-pressed={unit === u}
          onClick={() => onChange(u)}
        >
          {u === 'km' ? 'Kilometres' : 'Miles'}
        </button>
      ))}
    </div>
  );
}
