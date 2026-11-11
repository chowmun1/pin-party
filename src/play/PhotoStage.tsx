import { useEffect, useRef, useState } from 'react';
import { useObjectUrl } from '../hooks/useObjectUrl';
import type { Photo } from '../types';

/** The round's photo, with a full-screen view for TVs and small phones. */
export function PhotoStage({ photo, roundLabel }: { photo: Photo; roundLabel: string }) {
  const url = useObjectUrl(photo.imageBlob);
  const [full, setFull] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const openBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!full) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      openBtn.current?.focus();
    };
  }, [full]);

  return (
    <figure className="photo-stage">
      <div className="photo-stage-img">
        {url && <img src={url} alt={`Mystery photo for ${roundLabel}`} />}
        <button ref={openBtn} type="button" className="btn btn-small photo-expand" onClick={() => setFull(true)}>
          ⤢ Full screen
        </button>
      </div>
      {photo.caption && <figcaption className="photo-caption">💡 {photo.caption}</figcaption>}

      {full && (
        <div className="photo-full" role="dialog" aria-modal="true" aria-label="Photo, full screen" onClick={() => setFull(false)}>
          {url && <img src={url} alt={`Mystery photo for ${roundLabel}`} />}
          <button ref={closeBtn} type="button" className="btn photo-full-close" onClick={() => setFull(false)}>
            ✕ Close
          </button>
        </div>
      )}
    </figure>
  );
}
