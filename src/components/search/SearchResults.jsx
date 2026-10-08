import { Link } from 'react-router-dom';
import { kindLabel } from '../../lib/format.js';
import Button from '../ui/Button.jsx';
import { Popcorn, Search } from '../ui/Icons.jsx';
import Price from '../ui/Price.jsx';

/** Split a title around the first match so the matched part can be emphasised. */
function highlight(title, query) {
  const at = title.toLowerCase().indexOf(query.trim().toLowerCase());
  if (at < 0 || !query.trim()) return <span className="text-primary">{title}</span>;
  const end = at + query.trim().length;
  return (
    <>
      <span className="text-secondary">{title.slice(0, at)}</span>
      <span className="text-primary">{title.slice(at, end)}</span>
      <span className="text-secondary">{title.slice(end)}</span>
    </>
  );
}

function EmptyPanel({ icon, title, text, onBrowse }) {
  return (
    <div className="flex flex-col items-center px-4 pb-[35px] pt-[39px] text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-tint text-white">{icon}</span>
      <p className="t-label-m mt-[20.5px] text-primary">{title}</p>
      <p className="t-body-m mt-[7px] text-secondary">{text}</p>
      <Button variant="secondary" to="/sessions" onClick={onBrowse} className="mt-[20.5px]">
        Browse all sessions
      </Button>
    </div>
  );
}

export function SearchPrompt({ onNavigate }) {
  return (
    <EmptyPanel
      icon={<Popcorn size={20} strokeWidth={1.8} aria-hidden="true" />}
      title="What do you want to watch?"
      text="Search by title, director or cast"
      onBrowse={onNavigate}
    />
  );
}

export function SearchEmpty({ query, onNavigate }) {
  return (
    <EmptyPanel
      icon={<Search size={18} strokeWidth={1.8} aria-hidden="true" />}
      title={`No results for “${query.trim()}”`}
      text="Check the spelling or try another film or live event."
      onBrowse={onNavigate}
    />
  );
}

export default function SearchResults({ query, results, onNavigate }) {
  return (
    <div className="px-[9px] pb-[6px] pt-[15px]">
      <div className="flex items-baseline justify-between px-2">
        <h2 className="t-overline text-secondary">Films &amp; Events</h2>
        <p className="t-body-s leading-none text-secondary" aria-live="polite">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </p>
      </div>
      <ul className="mt-[7px]">
        {results.map((movie) => (
          <li key={movie.slug}>
            <Link
              to={`/movie/${movie.slug}`}
              onClick={onNavigate}
              className="flex h-[74px] items-center rounded-[10px] pl-2 pr-4 transition-colors duration-150 hover:bg-tint focus-visible:bg-tint"
            >
              <img
                src={movie.posterUrl || undefined}
                alt=""
                width="40"
                height="56"
                className="h-14 w-10 shrink-0 rounded-[4px] bg-card object-cover"
              />
              <span className="ml-[14px] flex min-w-0 flex-1 flex-col gap-[5px]">
                <span className="t-label-m truncate">{highlight(movie.title, query)}</span>
                <span className="t-body-s leading-none text-secondary">
                  {kindLabel(movie.kind)} · {movie.ageRating.code} · {movie.runtimeMinutes} min
                </span>
              </span>
              {movie.isComingSoon ? (
                <span className="t-label-m ml-3 shrink-0 text-warning">Coming Soon</span>
              ) : (
                <Price value={movie.fromPrice} prefix="from" className="t-label-m ml-3 shrink-0 text-primary" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
