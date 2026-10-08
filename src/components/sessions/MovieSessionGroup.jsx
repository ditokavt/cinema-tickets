import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Img from '../ui/Img.jsx';
import SessionCard from './SessionCard.jsx';

/** One film on the Sessions page: poster, title, rating, runtime and its row of showtimes. */
export default function MovieSessionGroup({ movie, sessions, onSelect }) {
  return (
    <section aria-label={movie.title} className="min-w-0">
      <div className="flex items-center gap-4">
        <Link to={`/movie/${movie.slug}`} aria-label={movie.title} className="shrink-0" tabIndex={-1}>
          <Img src={movie.posterUrl} className="h-20 w-14 rounded-[8px] object-cover" />
        </Link>
        <div className="flex min-w-0 flex-col gap-[13px]">
          <div className="flex items-center gap-3">
            <h3 className="t-h3 truncate">
              <Link to={`/movie/${movie.slug}`}>{movie.title}</Link>
            </h3>
            <Badge variant="age" title={movie.ageRating.description}>
              {movie.ageRating.code}
            </Badge>
          </div>
          <p className="t-body-m text-secondary">{movie.runtimeMinutes} min</p>
        </div>
      </div>
      <div className="no-scrollbar relative mt-[14px] flex gap-3 overflow-x-auto">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
