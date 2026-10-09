import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Img from '../ui/Img.jsx';

/** Recently viewed card, 329×87: thumbnail, title, genre · runtime, age badge. */
export default function RecentlyViewedCard({ movie }) {
  return (
    <Link
      to={`/movie/${movie.slug}`}
      draggable="false"
      className="flex h-[87px] w-[329px] max-w-[calc(100vw-32px)] shrink-0 items-start gap-[12.4px] rounded-[16px] bg-card p-[10px] transition-colors duration-150 hover:bg-raised"
    >
      <Img src={movie.posterUrl || movie.backdropUrl} className="h-[67px] w-[87px] shrink-0 rounded-[8px] object-cover" loading="lazy" draggable="false" />
      <span className="flex min-w-0 flex-1 flex-col items-start pt-[3.3px]">
        <span className="t-button w-full truncate uppercase">{movie.title}</span>
        <span className="t-body-s mt-[3.9px] w-full truncate text-secondary">
          {[movie.genres?.[0]?.name, `${movie.runtimeMinutes} min`].filter(Boolean).join(' · ')}
        </span>
        <Badge variant="age" className="mt-[4.7px] px-[9px]">
          {movie.ageRating?.code}
        </Badge>
      </span>
    </Link>
  );
}
