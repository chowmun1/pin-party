import { createHashRouter, useParams } from 'react-router-dom';
import App from './App';
import ComingSoonPage from './pages/ComingSoonPage';
import EditorPage from './pages/EditorPage';
import HomePage from './pages/HomePage';
import PlayPage from './pages/PlayPage';

/** Remount the editor when switching between quizzes so state never leaks across. */
function KeyedEditor() {
  const { id } = useParams();
  return <EditorPage key={id ?? 'new'} />;
}

function KeyedPlay() {
  const { id } = useParams();
  return <PlayPage key={id} />;
}

/*
 * Hash routing: URLs look like /pin-party/#/quiz/123/edit, so GitHub Pages
 * (which only serves real files) never returns a 404 on refresh.
 */
export const router = createHashRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/quiz/new', element: <KeyedEditor /> },
      { path: '/quiz/:id/edit', element: <KeyedEditor /> },
      { path: '/quiz/:id/play', element: <KeyedPlay /> },
      { path: '*', element: <ComingSoonPage what="This page" /> },
    ],
  },
]);
