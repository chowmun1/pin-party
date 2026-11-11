import { Link, Outlet } from 'react-router-dom';
import { APP_NAME } from './config';
import { PinLogo } from './components/PinLogo';

/** App shell: header + the current page. */
export default function App() {
  return (
    <div className="app">
      <a href="#main" className="skip-link" onClick={(e) => {
        e.preventDefault();
        document.getElementById('main')?.focus();
      }}>
        Skip to content
      </a>
      <header className="app-header">
        <Link to="/" className="brand" aria-label={`${APP_NAME} home`}>
          <PinLogo size={36} />
          <span>{APP_NAME}</span>
        </Link>
      </header>
      <main className="app-main" id="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
