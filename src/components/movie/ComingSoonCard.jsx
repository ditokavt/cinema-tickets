import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { releaseLabel } from '../../lib/format.js';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Img from '../ui/Img.jsx';

/**
 * Coming Soon card, 470×160, with Notify Me -> Reminder set.
 * A coming-soon title has no sessions, so nothing on this card leads to seat
 * selection: the picture and title open the film's page, the button sets a reminder.
 */
export default function ComingSoonCard({ movie }) {
  const { reminders, notify } = useApp();
  const reminded = movie.isNotified || reminders.includes(movie.slug);
  const href = `/movie/${movie.slug}`;

  return (
    <article className="flex h-[160px] w-[470px] max-w-[calc(100vw-32px)] shrink-0 gap-[15px] rounded-[20px] bg-card p-3 shadow-[0_1px_4px_rgba(0,0,0,0.25)]">
      <Link to={href} className="block shrink-0 overflow-hidden rounded-[14px]" aria-label={movie.title} draggable="false" tabIndex={-1}>
        <Img
          src={movie.backdropUrl || movie.posterUrl}
          fallbackLabel={movie.title}
          className="h-[136px] w-[229px] object-cover max-sm:w-[116px]"
          loading="lazy"
          draggable="false"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col items-start pt-[1.8px]">
        <p className="t-label-s w-full shrink-0 truncate uppercase text-brand">{releaseLabel(movie.releaseDate)}</p>
        <h3 className="t-label-s mt-[5.6px] w-full shrink-0 truncate">
          <Link to={href} draggable="false">
            {movie.title}
          </Link>
        </h3>
        <p className="t-body-s mt-[6.3px] w-full shrink-0 truncate text-secondary">
          {[movie.genres?.[0]?.name, `${movie.runtimeMinutes} min`].filter(Boolean).join(' · ')}
        </p>
        <Badge variant="age" title={movie.ageRating?.description} className="mt-[7.7px]">
          {movie.ageRating?.code}
        </Badge>
        {reminded ? (
          <Button variant="reminder-set" disabled className="mt-5" aria-live="polite">
            Reminder set
          </Button>
        ) : (
          <Button variant="notify" className="mt-5" onClick={() => notify(movie.slug)}>
            Notify Me
          </Button>
        )}
      </div>
    </article>
  );
}
