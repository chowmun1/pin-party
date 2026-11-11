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

  return (
    <li className={cls}>
      <button
        type="button"
        className="photo-item-main"
        onClick={() => onSelect(photo.id)}
        aria-current={selected ? 'true' : undefined}
        aria-label={`Photo ${n}${photo.caption ? `: ${photo.caption}` : ''}. ${pinned ? 'Answer set' : 'Needs answer pin'}`}
      >
        <span className="photo-item-thumb">{url && <img src={url} alt="" />}</span>
        <span className="photo-item-text">
          <span className="photo-item-num">Photo {n}</span>
          <span className={pinned ? 'status-ok' : 'status-warn'}>{pinned ? '✓ Pinned' : '⚠ Needs pin'}</span>
        </span>
      </button>
      <div className="photo-item-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          aria-label={`Move photo ${n} up`}
          title="Move up"
        >
          ▲
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onMove(index, 1)}
          disabled={index === count - 1}
          aria-label={`Move photo ${n} down`}
          title="Move down"
        >
          ▼
        </button>
        <button
          type="button"
          className="icon-btn icon-btn-danger"
          onClick={() => onDelete(photo.id)}
          aria-label={`Delete photo ${n}`}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
