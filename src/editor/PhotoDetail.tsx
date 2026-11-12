import { useCallback, useId } from 'react';
import { MapPin } from 'lucide-react';
import { LocationPicker } from '../components/LocationPicker';
import { useObjectUrl } from '../hooks/useObjectUrl';
import type { LatLng } from '../types';
import { ANSWER_NAME_MAX, CAPTION_MAX, hasPin, type DraftPhoto } from './draft';

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
  const nameId = useId();
  const nameHelpId = useId();
  const captionHelpId = useId();
  const { id } = photo;

  const setPin = useCallback(
    (pos: LatLng) => onChange(id, { lat: pos.lat, lng: pos.lng, fromExif: false }),
    [id, onChange],
  );

  return (
    <div className="photo-detail sheet">
      <h2 className="sheet-title">Photo {index + 1}</h2>
      <div className="photo-detail-top">
        <div className="photo-frame">{url && <img src={url} alt={`Photo ${index + 1}`} />}</div>
        <div className="photo-detail-fields">
          <label htmlFor={nameId} className="label">
            Place name <span className="optional">(optional)</span>
          </label>
          <input
            id={nameId}
            className="input"
            value={photo.answerName}
            maxLength={ANSWER_NAME_MAX}
            placeholder="e.g. Lake Como, Italy"
            aria-describedby={nameHelpId}
            onChange={(e) => onChange(id, { answerName: e.target.value })}
          />
          <p id={nameHelpId} className="help">
            Kept secret until the reveal.
          </p>

          <label htmlFor={captionId} className="label">
            Hint <span className="optional">(optional)</span>
          </label>
          <input
            id={captionId}
            className="input"
            value={photo.caption}
            maxLength={CAPTION_MAX}
            placeholder="e.g. We ate the best pizza here"
            aria-describedby={captionHelpId}
            onChange={(e) => onChange(id, { caption: e.target.value })}
          />
          <p id={captionHelpId} className="help">
            Shown to players while they guess.
          </p>
        </div>
      </div>

      <h3 className="label label-lg">Where was it taken?</h3>
      {photo.fromExif && (
        <p className="notice-inline">
          <MapPin aria-hidden="true" />
          Filled in from the photo's location data. Drag the pin if it's a little off.
        </p>
      )}
      {showMissing && !hasPin(photo) && (
        <p className="field-error" role="alert">
          Click the map to show where this photo was taken.
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
