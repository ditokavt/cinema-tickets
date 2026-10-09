import { cn } from '../../lib/cn.js';
import { Timer } from '../ui/Icons.jsx';

/**
 * The pill row under a film's title: age rating, runtime, formats.
 * `compact` is the slightly tighter set on the film page (gap 7, 2px less padding).
 */
export default function MetaBadges({ movie, compact = false, className }) {
  const pill = 't-label-s flex h-[25px] shrink-0 items-center whitespace-nowrap rounded-full';
  const formats = (movie.formats ?? []).filter((f) => f.slug !== 'standard');
  return (
    <ul className={cn('flex flex-wrap', compact ? 'gap-[7px]' : 'gap-2', className)}>
      {movie.ageRating && (
        <li className={cn(pill, 'bg-tint-red text-brand', compact ? 'px-[10.3px]' : 'px-[12.3px]')} title={movie.ageRating.description}>
          {movie.ageRating.code}
        </li>
      )}
      {movie.runtimeMinutes ? (
        <li className={cn(pill, 'h-[26px] gap-[5.5px] bg-tint text-white', compact ? 'pl-[10px] pr-[10.6px]' : 'pl-3 pr-[12.6px]')}>
          <Timer size={13} strokeWidth={2} aria-hidden="true" />
          {movie.runtimeMinutes} Min
        </li>
      ) : null}
      {formats.map((format) => (
        <li key={format.slug} className={cn(pill, 'bg-tint uppercase text-white', compact ? 'px-[10.1px]' : 'px-[12.1px]')}>
          {format.name}
        </li>
      ))}
    </ul>
  );
}
