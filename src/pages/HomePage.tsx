import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '../config';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { friendlyError } from '../lib/errors';
import { ensureDemoQuiz } from '../seed/demoQuiz';
import { quizRepository } from '../storage';
import { downloadQuiz, readImportFile } from '../storage/exportImport';
import type { Quiz } from '../types';

type Notice = { kind: 'error' | 'success'; text: string } | null;

export default function HomePage() {
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const incoming = (location.state as { notice?: string } | null)?.notice;
  const [notice, setNotice] = useState<Notice>(incoming ? { kind: 'success', text: incoming } : null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setQuizzes(await quizRepository.listQuizzes());
    } catch (err) {
      setQuizzes([]);
      setNotice({ kind: 'error', text: friendlyError(err) });
    }
  }, []);

  // Clear the one-off "Saved" message from history so a refresh doesn't show it again.
  useEffect(() => {
    if (incoming) navigate('.', { replace: true, state: null });
  }, [incoming, navigate]);

  useEffect(() => {
    document.title = APP_NAME;
    ensureDemoQuiz(quizRepository)
      .catch((err) => setNotice({ kind: 'error', text: friendlyError(err) }))
      .finally(refresh);
  }, [refresh]);

  async function handleDelete(quiz: Quiz) {
    if (!window.confirm(`Delete "${quiz.title}"? This can't be undone.`)) return;
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
      setNotice({ kind: 'success', text: `Imported "${quiz.title}" (${quiz.photos.length} photos).` });
      await refresh();
    } catch (err) {
      setNotice({ kind: 'error', text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="page-head">
        <h1>Your quizzes</h1>
        <div className="row">
          <Link to="/quiz/new" className="btn btn-primary">
            + Create new quiz
          </Link>
          <button className="btn" onClick={() => fileInput.current?.click()} disabled={busy}>
            {busy ? 'Importing…' : 'Import quiz'}
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
      </div>

      {notice && (
        <div className={`notice notice-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
          <span>{notice.text}</span>
          <button className="btn-link" onClick={() => setNotice(null)} aria-label="Dismiss message">
            ✕
          </button>
        </div>
      )}

      {quizzes === null ? (
        <p className="muted">Loading…</p>
      ) : quizzes.length === 0 ? (
        <div className="panel center empty">
          <h2>No quizzes yet</h2>
          <p>Create one from your own photos, or import a quiz file someone shared with you.</p>
          <Link to="/quiz/new" className="btn btn-primary">
            + Create your first quiz
          </Link>
        </div>
      ) : (
        <ul className="quiz-grid">
          {quizzes.map((q) => (
            <QuizCard key={q.id} quiz={q} onDelete={handleDelete} onExport={handleExport} />
          ))}
        </ul>
      )}
    </section>
  );
}

function QuizCard({
  quiz,
  onDelete,
  onExport,
}: {
  quiz: Quiz;
  onDelete: (q: Quiz) => void;
  onExport: (q: Quiz) => void;
}) {
  const thumb = useObjectUrl(quiz.photos[0]?.imageBlob);
  const count = quiz.photos.length;
  return (
    <li className="quiz-card">
      <div className="quiz-thumb">{thumb ? <img src={thumb} alt="" /> : <span aria-hidden>📍</span>}</div>
      <div className="quiz-body">
        <h2 className="quiz-title">{quiz.title}</h2>
        <p className="muted">
          {count} photo{count === 1 ? '' : 's'}
          {quiz.description ? ` · ${quiz.description}` : ''}
        </p>
        <div className="row wrap">
          <Link
            to={`/quiz/${quiz.id}/play`}
            className="btn btn-primary"
            aria-label={`Play ${quiz.title}`}
            aria-disabled={count === 0}
          >
            ▶ Play
          </Link>
          <Link to={`/quiz/${quiz.id}/edit`} className="btn" aria-label={`Edit ${quiz.title}`}>
            Edit
          </Link>
          <button className="btn" onClick={() => onExport(quiz)} aria-label={`Export ${quiz.title}`}>
            Export
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(quiz)} aria-label={`Delete ${quiz.title}`}>
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
