import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Download, Pencil, Play, Plus, Trash2, Upload, X } from 'lucide-react';
import { APP_NAME } from '../config';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MenuButton } from '../components/MenuButton';
import { Stamp } from '../components/Stamp';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { friendlyError } from '../lib/errors';
import { ensureDemoQuiz } from '../seed/demoQuiz';
import { quizRepository } from '../storage';
import { downloadQuiz, readImportFile } from '../storage/exportImport';
import type { Quiz } from '../types';

type Notice = { kind: 'error' | 'success'; text: string } | null;

const STAMP_COLORS = ['var(--red)', 'var(--green)', 'var(--blue)', 'var(--ink)'];

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const incoming = (location.state as { notice?: string } | null)?.notice;
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [notice, setNotice] = useState<Notice>(incoming ? { kind: 'success', text: incoming } : null);
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Quiz | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Clear the one-off "Saved" message from history so a refresh doesn't show it again.
  useEffect(() => {
    if (incoming) navigate('.', { replace: true, state: null });
  }, [incoming, navigate]);

  const refresh = useCallback(async () => {
    try {
      setQuizzes(await quizRepository.listQuizzes());
    } catch (err) {
      setQuizzes([]);
      setNotice({ kind: 'error', text: friendlyError(err) });
    }
  }, []);

  useEffect(() => {
    document.title = APP_NAME;
    ensureDemoQuiz(quizRepository)
      .catch((err) => setNotice({ kind: 'error', text: friendlyError(err) }))
      .finally(refresh);
  }, [refresh]);

  async function confirmDelete() {
    const quiz = toDelete;
    setToDelete(null);
    if (!quiz) return;
    try {
      await quizRepository.deleteQuiz(quiz.id);
      setNotice({ kind: 'success', text: `Deleted "${quiz.title}".` });
      await refresh();
    } catch (err) {
      setNotice({ kind: 'error', text: friendlyError(err) });
    }
  }

  async function handleExport(quiz: Quiz) {
    try {
      await downloadQuiz(quiz);
      setNotice({ kind: 'success', text: `Saved "${quiz.title}" as a file you can share.` });
    } catch (err) {
      setNotice({ kind: 'error', text: friendlyError(err) });
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;
    setBusy(true);
    try {
      const quiz = await readImportFile(file);
      await quizRepository.saveQuiz(quiz);
      setNotice({ kind: 'success', text: `Added "${quiz.title}" (${quiz.photos.length} photos).` });
      await refresh();
    } catch (err) {
      setNotice({ kind: 'error', text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="home">
      <div className="home-head">
        <h1 className="display display-xl">Where have you been?</h1>
        <p className="lead on-ground">Pick a postcard to play, or turn your own trip photos into a new one.</p>
      </div>

      {notice && (
        <div className={`notice notice-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
          <span>{notice.text}</span>
          <button className="btn btn-ghost btn-icon" onClick={() => setNotice(null)} aria-label="Dismiss message">
            <X aria-hidden="true" />
          </button>
        </div>
      )}

      {quizzes === null ? (
        <p className="on-ground" role="status">
          Loading your postcards…
        </p>
      ) : (
        <ul className="postcard-grid">
          {quizzes.map((q, i) => (
            <QuizPostcard
              key={q.id}
              quiz={q}
              index={i}
              onDelete={setToDelete}
              onExport={handleExport}
            />
          ))}
          <li className="postcard-slot">
            <Link to="/quiz/new" className="postcard-new">
              <span className="postcard-new-icon" aria-hidden="true">
                <Plus />
              </span>
              <span className="display display-sm">Make a new quiz</span>
              <span className="hand">from your own trip photos</span>
            </Link>
          </li>
        </ul>
      )}

      <div className="home-foot on-ground">
        <span>Got a quiz file from someone?</span>
        <button className="btn btn-on-ground" onClick={() => fileInput.current?.click()} disabled={busy}>
          <Upload aria-hidden="true" />
          {busy ? 'Adding…' : 'Open a quiz file'}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          hidden
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete "${toDelete?.title ?? ''}"?`}
        confirmLabel="Delete quiz"
        cancelLabel="Keep it"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p>This removes the quiz and its photos from this device. It can't be undone.</p>
      </ConfirmDialog>
    </section>
  );
}

function QuizPostcard({
  quiz,
  index,
  onDelete,
  onExport,
}: {
  quiz: Quiz;
  index: number;
  onDelete: (q: Quiz) => void;
  onExport: (q: Quiz) => void;
}) {
  const thumb = useObjectUrl(quiz.photos[0]?.imageBlob);
  const count = quiz.photos.length;
  const playable = count > 0;
  return (
    <li className="postcard">
      <Link
        to={`/quiz/${quiz.id}/play`}
        className="postcard-photo"
        tabIndex={-1}
        aria-hidden="true"
        onClick={(e) => !playable && e.preventDefault()}
      >
        {thumb && <img src={thumb} alt="" />}
      </Link>
      <Stamp color={STAMP_COLORS[index % STAMP_COLORS.length]} tilt={index % 2 ? 4 : -3} className="postcard-stamp">
        <span className="stamp-num">{count}</span>
        <span className="stamp-label">{count === 1 ? 'round' : 'rounds'}</span>
      </Stamp>
      <div className="postcard-body">
        <h2 className="postcard-title">{quiz.title}</h2>
        {quiz.description && <p className="postcard-desc hand">{quiz.description}</p>}
        <div className="postcard-actions">
          {playable ? (
            <Link to={`/quiz/${quiz.id}/play`} className="btn btn-primary" aria-label={`Play ${quiz.title}`}>
              <Play aria-hidden="true" />
              Play
            </Link>
          ) : (
            <span className="btn btn-primary" aria-disabled="true">
              <Play aria-hidden="true" />
              Play
            </span>
          )}
          <Link to={`/quiz/${quiz.id}/edit`} className="btn btn-secondary" aria-label={`Edit ${quiz.title}`}>
            <Pencil aria-hidden="true" />
            Edit
          </Link>
          <MenuButton
            label={`More options for ${quiz.title}`}
            items={[
              { label: 'Save as file to share', icon: <Download aria-hidden="true" />, onSelect: () => onExport(quiz) },
              { label: 'Delete quiz', icon: <Trash2 aria-hidden="true" />, danger: true, onSelect: () => onDelete(quiz) },
            ]}
          />
        </div>
      </div>
    </li>
  );
}
