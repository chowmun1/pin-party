import { useEffect, useId, useRef, useState } from 'react';
import { searchPlaces, type PlaceResult } from '../lib/geocode';

/** Search box that looks up place names (Nominatim) and reports the chosen one. */
export function PlaceSearch({ onPick }: { onPick: (place: PlaceResult) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[] | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const inputId = useId();
  const listId = useId();

  useEffect(() => () => abort.current?.abort(), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setLoading(true);
    setError(undefined);
    try {
      setResults(await searchPlaces(query, ctrl.signal));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Search failed.');
      setResults(null);
    } finally {
      if (abort.current === ctrl) setLoading(false);
    }
  }

  return (
    <div className="place-search">
      <form onSubmit={submit} className="row" role="search">
        <label htmlFor={inputId} className="sr-only">
          Search for a place
        </label>
        <input
          id={inputId}
          className="input"
          type="search"
          placeholder="Search a place to jump the map…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-controls={results ? listId : undefined}
        />
        <button className="btn" type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {results && (
        <ul id={listId} className="search-results" aria-label="Search results">
          {results.length === 0 ? (
            <li className="muted">No places found.</li>
          ) : (
            results.map((r, i) => (
              <li key={`${r.lat},${r.lng},${i}`}>
                <button
                  type="button"
                  className="search-result"
                  onClick={() => {
                    onPick(r);
                    setResults(null);
                  }}
                >
                  {r.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
