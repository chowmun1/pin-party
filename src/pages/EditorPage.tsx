import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { APP_NAME } from '../config';
import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  draftFromQuiz,
  draftToQuiz,
  emptyDraft,
  moveItem,
  validateDraft,
  type DraftPhoto,
  type QuizDraft,
} from '../editor/draft';
import { DropZone } from '../editor/DropZone';
import { PhotoDetail } from '../editor/PhotoDetail';
import { PhotoList } from '../editor/PhotoList';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import { friendlyError } from '../lib/errors';
import { processImageFile } from '../lib/image';
import { quizRepository } from '../storage';
import { newId } from '../types';

type LoadState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string };

export default function EditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [load, setLoad] = useState<LoadState>(isNew ? { status: 'ready' } : { status: 'loading' });
  const [draft, setDraft] = useState<QuizDraft>(emptyDraft);
  const [dirty, setDirty] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const allowLeave = useUnsavedChangesWarning(dirty);
  const titleId = useId();
  const descId = useId();

  // Load existing quiz
  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    quizRepository
      .getQuiz(id)
      .then((quiz) => {
        if (cancelled) return;
        if (!quiz) {
          setLoad({ status: 'error', message: "This quiz doesn't exist (it may have been deleted)." });
          return;
        }
        const d = draftFromQuiz(quiz);
        setDraft(d);
        setSelectedId(d.photos[0]?.id ?? null);
        setLoad({ status: 'ready' });
      })
      .catch((err) => !cancelled && setLoad({ status: 'error', message: friendlyError(err) }));
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  useEffect(() => {
    document.title = `${isNew ? 'New quiz' : 'Edit quiz'} · ${APP_NAME}`;
  }, [isNew]);

  // Stop the browser opening a file dropped outside the drop zone (which would lose edits).
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  const update = useCallback((fn: (d: QuizDraft) => QuizDraft) => {
    setDraft(fn);
    setDirty(true);
    setSaveError(undefined);
  }, []);

  const updatePhoto = useCallback(
    (photoId: string, patch: Partial<DraftPhoto>) =>
      update((d) => ({ ...d, photos: d.photos.map((p) => (p.id === photoId ? { ...p, ...patch } : p)) })),
    [update],
  );

  async function addFiles(files: File[]) {
    setUploadErrors([]);
    setProgress({ done: 0, total: files.length });
    const errors: string[] = [];
    let firstAdded: string | null = null;
    // One at a time keeps memory use low with many large photos.
    for (let i = 0; i < files.length; i++) {
      try {
        const { blob, gps } = await processImageFile(files[i]);
        const photo: DraftPhoto = {
          id: newId(),
          imageBlob: blob,
          caption: '',
          lat: gps?.lat ?? null,
          lng: gps?.lng ?? null,
          fromExif: !!gps,
        };
        firstAdded ??= photo.id;
        update((d) => ({ ...d, photos: [...d.photos, photo] }));
      } catch (err) {
        errors.push(friendlyError(err));
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setProgress(null);
    setUploadErrors(errors);
    if (firstAdded) setSelectedId((cur) => cur ?? firstAdded);
  }

  function movePhoto(index: number, delta: -1 | 1) {
    update((d) => ({ ...d, photos: moveItem(d.photos, index, index + delta) }));
  }

  function deletePhoto(photoId: string) {
    const idx = draft.photos.findIndex((p) => p.id === photoId);
    if (!window.confirm(`Remove photo ${idx + 1} from this quiz?`)) return;
    const remaining = draft.photos.filter((p) => p.id !== photoId);
    update((d) => ({ ...d, photos: d.photos.filter((p) => p.id !== photoId) }));
    if (selectedId === photoId) {
      setSelectedId(remaining[Math.min(idx, remaining.length - 1)]?.id ?? null);
    }
  }

  const validation = validateDraft(draft);

  async function save() {
    if (!validation.ok) {
      setShowValidation(true);
      if (validation.missingPins.length) setSelectedId(validation.missingPins[0]);
      if (validation.titleError) document.getElementById(titleId)?.focus();
      return;
    }
    setSaving(true);
    setSaveError(undefined);
    try {
      const quiz = draftToQuiz(draft);
      await quizRepository.saveQuiz(quiz);
      allowLeave();
      setDirty(false);
      navigate('/', { state: { notice: `Saved "${quiz.title}".` } });
    } catch (err) {
      setSaveError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  if (load.status === 'loading') return <p className="muted">Loading quiz…</p>;
  if (load.status === 'error') {
    return (
      <section className="panel center">
        <h1>Can't open this quiz</h1>
        <p>{load.message}</p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </section>
    );
  }

  const selectedIndex = draft.photos.findIndex((p) => p.id === selectedId);
  const selected = selectedIndex >= 0 ? draft.photos[selectedIndex] : null;
  const busy = progress !== null || saving;

  return (
    <section className="editor">
      <div className="page-head">
        <h1>{isNew ? 'New quiz' : 'Edit quiz'}</h1>
        <div className="row">
          <Link to="/" className="btn">
            Cancel
          </Link>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            {saving ? 'Saving…' : 'Save quiz'}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="notice notice-error" role="alert">
          <span>{saveError}</span>
        </div>
      )}
      {showValidation && !validation.ok && (
        <div className="notice notice-error" role="alert">
          <span>
            Can't save yet: {[validation.titleError, validation.photosError].filter(Boolean).join(' ')}
          </span>
        </div>
      )}

      <div className="panel editor-meta">
        <label htmlFor={titleId} className="label">
          Quiz title
        </label>
        <input
          id={titleId}
          className={`input input-big${showValidation && validation.titleError ? ' input-invalid' : ''}`}
          value={draft.title}
          maxLength={TITLE_MAX}
          placeholder="e.g. Our summer holidays"
          aria-invalid={showValidation && !!validation.titleError}
          onChange={(e) => update((d) => ({ ...d, title: e.target.value }))}
        />
        <label htmlFor={descId} className="label">
          Description <span className="muted">(optional)</span>
        </label>
        <textarea
          id={descId}
          className="input"
          rows={2}
          value={draft.description}
          maxLength={DESCRIPTION_MAX}
          onChange={(e) => update((d) => ({ ...d, description: e.target.value }))}
        />
      </div>

      <h2 className="section-title">
        Photos <span className="muted">({draft.photos.length})</span>
      </h2>

      <DropZone onFiles={addFiles} disabled={busy} />

      {progress && (
        <p className="notice notice-info" role="status">
          Processing photo {Math.min(progress.done + 1, progress.total)} of {progress.total}…
        </p>
      )}
      {uploadErrors.length > 0 && (
        <div className="notice notice-error" role="alert">
          <div>
            <strong>
              {uploadErrors.length} file{uploadErrors.length === 1 ? '' : 's'} couldn't be added:
            </strong>
            <ul className="error-list">
              {uploadErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
          <button className="btn-link" onClick={() => setUploadErrors([])} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      {draft.photos.length > 0 && (
        <div className="editor-grid">
          <PhotoList
            photos={draft.photos}
            selectedId={selectedId}
            highlightMissing={showValidation}
            onSelect={setSelectedId}
            onMove={movePhoto}
            onDelete={deletePhoto}
          />
          {selected ? (
            <PhotoDetail
              photo={selected}
              index={selectedIndex}
              showMissing={showValidation}
              onChange={updatePhoto}
            />
          ) : (
            <div className="panel center muted">Select a photo to set its answer.</div>
          )}
        </div>
      )}
    </section>
  );
}
