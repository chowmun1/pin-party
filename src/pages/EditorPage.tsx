import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { APP_NAME } from '../config';
import { ConfirmDialog } from '../components/ConfirmDialog';
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
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  const { allowLeave, prompt: leavePrompt } = useUnsavedChangesWarning(dirty);
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
          setLoad({ status: 'error', message: "This quiz doesn't exist any more. It may have been deleted." });
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
          answerName: '',
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

  function deletePhoto() {
    const photoId = photoToDelete;
    setPhotoToDelete(null);
    if (!photoId) return;
    const idx = draft.photos.findIndex((p) => p.id === photoId);
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

  if (load.status === 'loading') return <p className="on-ground">Loading quiz…</p>;
  if (load.status === 'error') {
    return (
      <section className="postcard-back lone-card">
        <h1 className="display">Can't open this quiz</h1>
        <p className="lead">{load.message}</p>
        <Link to="/" className="btn btn-primary btn-lg">
          Back to your quizzes
        </Link>
      </section>
    );
  }

  const selectedIndex = draft.photos.findIndex((p) => p.id === selectedId);
  const selected = selectedIndex >= 0 ? draft.photos[selectedIndex] : null;
  const busy = progress !== null || saving;
  const deleteIndex = draft.photos.findIndex((p) => p.id === photoToDelete);

  return (
    <section className="editor">
      <div className="page-head">
        <h1 className="display">{isNew ? 'New quiz' : 'Edit quiz'}</h1>
        <div className="row">
          <Link to="/" className="btn btn-on-ground">
            Cancel
          </Link>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            <Save aria-hidden="true" />
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
            Not quite ready to save: {[validation.titleError, validation.photosError].filter(Boolean).join(' ')}
          </span>
        </div>
      )}

      <div className="sheet editor-meta">
        <label htmlFor={titleId} className="label">
          Quiz title
        </label>
        <input
          id={titleId}
          className={`input input-title${showValidation && validation.titleError ? ' input-invalid' : ''}`}
          value={draft.title}
          maxLength={TITLE_MAX}
          placeholder="e.g. Our summer in Italy"
          aria-invalid={showValidation && !!validation.titleError}
          onChange={(e) => update((d) => ({ ...d, title: e.target.value }))}
        />
        <label htmlFor={descId} className="label">
          Description <span className="optional">(optional)</span>
        </label>
        <textarea
          id={descId}
          className="input"
          rows={2}
          value={draft.description}
          maxLength={DESCRIPTION_MAX}
          placeholder="A line to show on the postcard"
          onChange={(e) => update((d) => ({ ...d, description: e.target.value }))}
        />
      </div>

      <h2 className="section-title on-ground">
        Photos <span className="count">{draft.photos.length}</span>
      </h2>

      <DropZone onFiles={addFiles} disabled={busy} />

      {progress && (
        <p className="notice notice-info" role="status">
          Getting photo {Math.min(progress.done + 1, progress.total)} of {progress.total} ready…
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
          <button className="btn btn-ghost btn-icon" onClick={() => setUploadErrors([])} aria-label="Dismiss">
            <X aria-hidden="true" />
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
            onDelete={setPhotoToDelete}
          />
          {selected ? (
            <PhotoDetail
              photo={selected}
              index={selectedIndex}
              showMissing={showValidation}
              onChange={updatePhoto}
            />
          ) : (
            <div className="sheet empty-detail">Pick a photo on the left to set where it was taken.</div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!photoToDelete}
        title={`Remove photo ${deleteIndex + 1}?`}
        confirmLabel="Remove photo"
        cancelLabel="Keep it"
        danger
        onConfirm={deletePhoto}
        onCancel={() => setPhotoToDelete(null)}
      >
        <p>It will be taken out of this quiz when you save.</p>
      </ConfirmDialog>
      {leavePrompt}
    </section>
  );
}
