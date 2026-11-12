import { AlertTriangle, ArrowDown, ArrowUp, Check, Trash2 } from 'lucide-react';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { hasPin, type DraftPhoto } from './draft';

export function PhotoList({
  photos,
  selectedId,
  highlightMissing,
  onSelect,
  onMove,
  onDelete,
}: {
  photos: DraftPhoto[];
  selectedId: string | null;
  highlightMissing: boolean;
  onSelect: (id: string) => void;
  onMove: (index: number, delta: -1 | 1) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <ol className="photo-list" aria-label="Photos in this quiz">
      {photos.map((p, i) => (
        <PhotoListItem
          key={p.id}
          photo={p}
          index={i}
          count={photos.length}
          selected={p.id === selectedId}
          highlightMissing={highlightMissing}
          onSelect={onSelect}
          onMove={onMove}
          onDelete={onDelete}
        />
      ))}
    </ol>
  );
}

function PhotoListItem({
  photo,
  index,
  count,
  selected,
  highlightMissing,
  onSelect,
  onMove,
  onDelete,
}: {
  photo: DraftPhoto;
  index: number;
  count: number;
  selected: boolean;
  highlightMissing: boolean;
  onSelect: (id: string) => void;
  onMove: (index: number, delta: -1 | 1) => void;
  onDelete: (id: string) => void;
}) {
  const url = useObjectUrl(photo.imageBlob);
  const pinned = hasPin(photo);
  const n = index + 1;
  const cls = ['photo-item', selected && 'selected', !pinned && highlightMissing && 'missing']
    .filter(Boolean)
    .join(' ');
  const name = photo.answerName.trim();

  return (
    <li className={cls}>
      <button
        type="button"
        className="photo-item-main"
        onClick={() => onSelect(photo.id)}
        aria-current={selected ? 'true' : undefined}
        aria-label={`Photo ${n}${name ? `, ${name}` : ''}. ${pinned ? 'Location set' : 'Needs a location'}`}
      >
        <span className="photo-item-thumb">{url && <img src={url} alt="" />}</span>
        <span className="photo-item-text">
          <span className="photo-item-num">{name || `Photo ${n}`}</span>
          <span className={pinned ? 'status status-ok' : 'status status-warn'}>
            {pinned ? <Check aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
            {pinned ? 'Location set' : 'Needs a location'}
          </span>
        </span>
      </button>
      <div className="photo-item-actions">
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          aria-label={`Move photo ${n} up`}
          title="Move up"
        >
          <ArrowUp aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={() => onMove(index, 1)}
          disabled={index === count - 1}
          aria-label={`Move photo ${n} down`}
          title="Move down"
        >
          <ArrowDown aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-icon btn-icon-danger"
          onClick={() => onDelete(photo.id)}
          aria-label={`Remove photo ${n}`}
          title="Remove"
        >
          <Trash2 aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
