import { useCallback, useId } from 'react';
import { LocationPicker } from '../components/LocationPicker';
import { useObjectUrl } from '../hooks/useObjectUrl';
import type { LatLng } from '../types';
import { CAPTION_MAX, hasPin, type DraftPhoto } from './draft';

export function PhotoDetail({
  photo,
  index,
  showMissing,
  onChange,
}: {
  photo: DraftPhoto;
  index: number;
  showMissing: boolean;
  onChange: (id: string, patch: Partial<DraftPhoto>) => void;
}) {
  const url = useObjectUrl(photo.imageBlob);
  const captionId = useId();
  const { id } = photo;

  const setPin = useCallback(
    (pos: LatLng) => onChange(id, { lat: pos.lat, lng: pos.lng, fromExif: false }),
    [id, onChange],
  );

  return (
    <div className="photo-detail panel">
      <h2>Photo {index + 1}</h2>
      <div className="photo-preview">{url && <img src={url} alt={`Photo ${index + 1} preview`} />}</div>

      <label htmlFor={captionId} className="label">
        Caption / hint <span className="muted">(optional, shown to players)</span>
      </label>
      <input
        id={captionId}
        className="input"
        value={photo.caption}
        maxLength={CAPTION_MAX}
        placeholder="e.g. “Somewhere sunny in Europe”"
        onChange={(e) => onChange(id, { caption: e.target.value })}
      />

      <h3 className="label">Answer location</h3>
      {photo.fromExif && (
        <p className="notice-inline">📍 Pre-filled from the photo's GPS data — drag the pin if it's off.</p>
      )}
      {showMissing && !hasPin(photo) && (
        <p className="field-error" role="alert">
          Set the answer pin for this photo before saving.
        </p>
      )}
      {/* key: remount the map per photo so it starts centred on that photo's pin */}
      <LocationPicker
        key={id}
        value={hasPin(photo) ? { lat: photo.lat!, lng: photo.lng! } : null}
        onChange={setPin}
      />
    </div>
  );
}
