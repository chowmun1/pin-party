import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';

/** Click-or-drop area for adding photos. */
export function DropZone({ onFiles, disabled }: { onFiles: (files: File[]) => void; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div
      className={`dropzone${over ? ' dropzone-over' : ''}${disabled ? ' dropzone-disabled' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled && e.dataTransfer.files.length) onFiles(Array.from(e.dataTransfer.files));
      }}
    >
      <ImagePlus className="dropzone-icon" aria-hidden="true" />
      <p className="dropzone-text">Drop your trip photos here</p>
      <button type="button" className="btn btn-primary" onClick={() => input.current?.click()} disabled={disabled}>
        Choose photos
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length) onFiles(files);
        }}
      />
      <p className="help">
        Photos are shrunk to save space. If a photo knows where it was taken, we'll place its pin for you.
      </p>
    </div>
  );
}
