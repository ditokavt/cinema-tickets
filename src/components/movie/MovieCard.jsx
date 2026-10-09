import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Img from '../ui/Img.jsx';
import Price from '../ui/Price.jsx';

/** Now Playing card, 260×452: poster, title, genre · runtime, age badge, "From ₾" and Buy Ticket. */
export default function MovieCard({ movie }) {
  const href = `/movie/${movie.slug}`;
  return (
    <article className="flex w-[260px] shrink-0 flex-col rounded-[20px] bg-card px-3 pb-[13.8px] pt-[13.8px] shadow-[0_1px_4px_rgba(0,0,0,0.25)]">
      <Link to={href} className="block overflow-hidden rounded-[14px]" aria-label={movie.title} draggable="false">
        <Img src={movie.posterUrl} fallbackLabel={movie.title} className="h-[300px] w-full object-cover" loading="lazy" draggable="false" />
      </Link>
      <h3 className="t-h3 mt-[9.4px] truncate">
        <Link to={href} draggable="false">
          {movie.title}
        </Link>
      </h3>
      <p className="t-body-s mt-[7.4px] truncate text-secondary">
        {[movie.genres?.[0]?.name, `${movie.runtimeMinutes} min`].filter(Boolean).join(' · ')}
      </p>
      <Badge variant="age" title={movie.ageRating?.description} className="mt-[7.7px] self-start">
        {movie.ageRating?.code}
      </Badge>
      <div className="mt-[8.4px] flex items-center justify-between gap-2">
        <Price value={movie.fromPrice} spaced prefix="From" className="t-label-s pl-px" />
        <Button to={href} size="sm" draggable="false">
          Buy Ticket
        </Button>
      </div>
    </article>
  );
}
