import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import HeroSlider from '../components/home/HeroSlider.jsx';
import { heroSlides } from '../data/heroSlides.js';
import ComingSoonCard from '../components/movie/ComingSoonCard.jsx';
import MovieCard from '../components/movie/MovieCard.jsx';
import RecentlyViewedCard from '../components/movie/RecentlyViewedCard.jsx';
import ScrollRow from '../components/ui/ScrollRow.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import StatePanel from '../components/ui/StatePanel.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { cn } from '../lib/cn.js';
import { readRecent } from '../lib/recent.js';

const SEE_ALL = 'text-[14px] font-semibold leading-[15px] text-brand hover:underline';

function SectionHead({ title, upper = true, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className={cn('t-h1', upper && 'uppercase')}>{title}</h2>
      {action}
    </div>
  );
}

/** One Home row with its three states: skeletons while loading, a retry panel on error, a line when empty. */
function Row({ state, onRetry, emptyTitle, errorTitle, skeleton, children }) {
  if (state.loading && !state.data) return <div className="flex gap-5 overflow-hidden">{skeleton}</div>;
  if (state.error) return <StatePanel error title={errorTitle} text={state.error.message} actionLabel="Try again" onAction={onRetry} />;
  if (!state.data?.length) return <StatePanel title={emptyTitle} />;
  return children;
}

/**
 * Home: hero of the four design films (fixed, not from the API), Recently viewed (for guests too), Now Playing
 * and Coming Soon. Each block loads, fails and retries on its own.
 */
export default function Home() {
  const { user } = useApp();
  const [attempt, setAttempt] = useState(0);
  const [allSoon, setAllSoon] = useState(false);
  const retry = () => setAttempt((n) => n + 1);

  const nowPlaying = useAsync(() => api.getNowPlaying(), [attempt]);
  // Signing in changes `isNotified`, so this list is re-read for the new account.
  const comingSoon = useAsync(() => api.getComingSoon(), [attempt, user?.id]);
  const recent = useMemo(() => readRecent(), []);

  return (
    <div className="pb-9">
      {/* Fixed hero: the four films from the design, see src/data/heroSlides.js */}
      <HeroSlider movies={heroSlides} />

      {recent.length > 0 && (
        <>
          <section aria-label="Recently viewed" className="container-home pt-10">
            <SectionHead title="Recently viewed" upper={false} />
            <ScrollRow label="Recently viewed films" className="mt-[21px]">
              {recent.map((movie) => (
                <div role="listitem" key={movie.slug} className="shrink-0">
                  <RecentlyViewedCard movie={movie} />
                </div>
              ))}
            </ScrollRow>
          </section>
          <hr className="mt-10 border-0 border-t border-raised" />
        </>
      )}

      <section aria-label="Now playing" className={cn('container-home', recent.length > 0 ? 'pt-10' : 'pt-[31.7px]')}>
        <SectionHead
          title="Now playing"
          action={
            <Link to="/sessions" className={SEE_ALL}>
              See all
            </Link>
          }
        />
        <div className="mt-[24.3px]">
          <Row
            state={nowPlaying}
            onRetry={retry}
            errorTitle="We couldn’t load what’s playing"
            emptyTitle="Nothing is playing right now"
            skeleton={Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-[452px] w-[260px] shrink-0 rounded-[20px]" />
            ))}
          >
            <ScrollRow gap={17} label="Films now playing">
              {nowPlaying.data?.map((movie) => (
                <div role="listitem" key={movie.slug} className="shrink-0">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </ScrollRow>
          </Row>
        </div>
      </section>

      <hr className="mt-10 border-0 border-t border-raised" />

      <section aria-label="Coming soon" className="container-home pt-10">
        <SectionHead
          title="Coming soon..."
          action={
            (comingSoon.data?.length ?? 0) > 1 && (
              <button type="button" aria-expanded={allSoon} onClick={() => setAllSoon((v) => !v)} className={SEE_ALL}>
                {allSoon ? 'Show less' : 'See all'}
              </button>
            )
          }
        />
        <div className="mt-[24.3px]">
          <Row
            state={comingSoon}
            onRetry={retry}
            errorTitle="We couldn’t load what’s coming"
            emptyTitle="No upcoming films announced yet"
            skeleton={Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-[160px] w-[470px] shrink-0 rounded-[20px]" />
            ))}
          >
            {allSoon ? (
              <ul className="flex flex-wrap gap-5">
                {comingSoon.data?.map((movie) => (
                  <li key={movie.slug}>
                    <ComingSoonCard movie={movie} />
                  </li>
                ))}
              </ul>
            ) : (
              <ScrollRow label="Films coming soon">
                {comingSoon.data?.map((movie) => (
                  <div role="listitem" key={movie.slug} className="shrink-0">
                    <ComingSoonCard movie={movie} />
                  </div>
                ))}
              </ScrollRow>
            )}
          </Row>
        </div>
      </section>
    </div>
  );
}
