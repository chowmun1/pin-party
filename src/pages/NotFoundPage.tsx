import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { APP_NAME } from '../config';
import { Postmark } from '../components/Postmark';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = `Page not found · ${APP_NAME}`;
  }, []);
  return (
    <section className="postcard-back lone-card">
      <Postmark ring="Return to sender" center="?" className="lone-postmark" />
      <h1 className="display">Return to sender</h1>
      <p className="hand lead">We couldn't find that page. It may have moved, or the link has a typo.</p>
      <Link to="/" className="btn btn-primary btn-lg">
        <Home aria-hidden="true" />
        Back to your quizzes
      </Link>
    </section>
  );
}
