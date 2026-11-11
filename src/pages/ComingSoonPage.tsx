import { Link } from 'react-router-dom';

export default function ComingSoonPage({ what, stage }: { what: string; stage?: number }) {
  return (
    <section className="panel center">
      <h1>{what} isn't built yet</h1>
      {stage && <p>Coming in stage {stage}.</p>}
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </section>
  );
}
