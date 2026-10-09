import { useEffect, useState } from 'react';
import { api } from '../../api';
import { heroImage } from '../../data/heroImages.js';
import { cn } from '../../lib/cn.js';
import { statusTag } from '../../lib/format.js';
import MetaBadges from '../movie/MetaBadges.jsx';
import Button from '../ui/Button.jsx';
import { ChevronLeft, ChevronRight, TicketIcon } from '../ui/Icons.jsx';
import Img from '../ui/Img.jsx';

export const SLIDE_MS = 5000; // the banner moves on every 5 seconds

const ARROW =
  'flex size-[54px] shrink-0 items-center justify-center rounded-full bg-[#070C1C]/20 text-white transition-colors duration-150 hover:bg-[#070C1C]/45 max-sm:size-10';

/**
 * Home hero: the featured films, one at a time, cross-fading every 5 seconds.
 * Arrows and the progress segments jump to a slide and restart the timer.
 */
export default function HeroSlider({ movies }) {
  const [index, setIndex] = useState(0);
  const [synopses, setSynopses] = useState({});
  const count = movies.length;
  const current = Math.min(index, count - 1);

  // The list endpoint has no synopsis; each slide's copy comes from the film itself.
  useEffect(() => {
    let alive = true;
    movies.forEach((movie) => {
      if (movie.synopsis) return;
      api
        .getMovie(movie.slug)
        .then((detail) => alive && setSynopses((all) => ({ ...all, [movie.slug]: detail.synopsis ?? '' })))
        .catch(() => {});
    });
    return () => {
      alive = false;
    };
  }, [movies]);

  // Re-armed on every change of slide, so a manual jump also gets its full 5 seconds.
  useEffect(() => {
    if (count < 2) return undefined;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [current, count]);

  const go = (step) => setIndex((current + step + count) % count);

  return (
    <section aria-roledescription="carousel" aria-label="Featured films" className="relative h-[clamp(580px,44vw,760px)] overflow-hidden bg-page">
      {movies.map((movie, i) => {
        const active = i === current;
        const synopsis = movie.synopsis ?? synopses[movie.slug];
        return (
          <div
            key={movie.slug}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${movie.title}`}
            aria-hidden={!active}
            className={cn('absolute inset-0 transition-opacity duration-700 ease-out', active ? 'opacity-100' : 'pointer-events-none opacity-0')}
          >
            <Img
              src={heroImage(movie, i)}
              className="absolute inset-0 size-full object-cover object-[50%_29%]"
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : undefined}
            />
            <div aria-hidden="true" className="hero-scrim absolute inset-0" />

            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[var(--frame)] px-[var(--hero-pad)] pb-[clamp(104px,10.4vw,179px)]">
              <div className="max-w-[560px]">
                <p className="t-body-s inline-flex h-[25px] items-center rounded-full bg-tint-red px-[11px] uppercase leading-none text-brand">{statusTag(movie)}</p>
                <h2 className="t-display mt-[14.4px] line-clamp-2 uppercase max-lg:text-[32px] max-sm:text-[28px]">{movie.title}</h2>
                <MetaBadges movie={movie} className="mt-[16.5px]" />
                {synopsis ? <p className="t-body-m mt-[14.8px] line-clamp-3 text-white">{synopsis}</p> : null}
                <div className="mt-[19.6px] flex flex-wrap gap-[10px]">
                  <Button
                    to={`/movie/${movie.slug}`}
                    tabIndex={active ? undefined : -1}
                    leftIcon={<TicketIcon size={16} />}
                    className="h-[42px] gap-[5px] pr-[21.8px]"
                  >
                    Buy tickets
                  </Button>
                  <Button to="/sessions" variant="secondary" tabIndex={active ? undefined : -1}>
                    All sessions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-[clamp(20px,2.43vw,42px)] mx-auto flex max-w-[var(--frame)] items-center gap-5 px-[var(--hero-pad)] max-sm:gap-3">
          <div className="flex flex-1 gap-[7px]">
            {movies.map((movie, i) => (
              <button
                key={movie.slug}
                type="button"
                aria-label={`Show ${movie.title}`}
                aria-current={i === current}
                onClick={() => setIndex(i)}
                className="group flex h-6 flex-1 items-center"
              >
                <span className={cn('h-[3px] w-full rounded-full transition-colors duration-300', i === current ? 'bg-brand' : 'bg-white group-hover:bg-white/70')} />
              </button>
            ))}
          </div>
          <div className="flex gap-[10px]">
            <button type="button" aria-label="Previous film" onClick={() => go(-1)} className={ARROW}>
              <ChevronLeft size={24} strokeWidth={2.25} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next film" onClick={() => go(1)} className={ARROW}>
              <ChevronRight size={24} strokeWidth={2.25} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
