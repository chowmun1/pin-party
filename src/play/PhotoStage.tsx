import { useEffect, useRef, useState } from 'react';
import { Lightbulb, Maximize2, X } from 'lucide-react';
import { useObjectUrl } from '../hooks/useObjectUrl';
import type { Photo } from '../types';

/** The round's photo as a postcard front, with a full-screen view for TVs and phones. */
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
      <div className="photo-frame photo-frame-stage">
        {url && <img src={url} alt={`Mystery photo for ${roundLabel}`} />}
        <button ref={openBtn} type="button" className="btn btn-secondary photo-expand" onClick={() => setFull(true)}>
          <Maximize2 aria-hidden="true" />
          Full screen
        </button>
      </div>
      {photo.caption && (
        <figcaption className="photo-hint">
          <Lightbulb aria-hidden="true" />
          <span className="hand">{photo.caption}</span>
        </figcaption>
      )}

      {full && (
        <div
          className="photo-full"
          role="dialog"
          aria-modal="true"
          aria-label="Photo, full screen"
          onClick={() => setFull(false)}
        >
          {url && <img src={url} alt={`Mystery photo for ${roundLabel}`} />}
          <button ref={closeBtn} type="button" className="btn btn-secondary photo-full-close" onClick={() => setFull(false)}>
            <X aria-hidden="true" />
            Close
          </button>
        </div>
      )}
    </figure>
  );
}
