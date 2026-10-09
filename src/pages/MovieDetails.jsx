import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import MetaBadges from '../components/movie/MetaBadges.jsx';
import DateSelector from '../components/sessions/DateSelector.jsx';
import SessionTicket from '../components/sessions/SessionTicket.jsx';
import Button from '../components/ui/Button.jsx';
import Img from '../components/ui/Img.jsx';
import Price from '../components/ui/Price.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import StatePanel from '../components/ui/StatePanel.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { ageMessage, isTooYoung, useBooking } from '../hooks/useBooking.js';
import { fullDate, groupByHall, hallLabel, longDate, releaseLabel } from '../lib/format.js';
import { rememberMovie } from '../lib/recent.js';

function Detail({ label, children }) {
  return (
    <div>
      <dt className="t-label-s uppercase text-secondary">{label}</dt>
      <dd className="t-label-m mt-[6.7px] text-primary">{children}</dd>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading film">
      <div className="bg-card pb-10 pt-[calc(var(--header-h)+24px)] lg:h-[567px] lg:pb-0 lg:pt-[152px]">
        <div className="container-x flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-[34px] lg:pl-[calc(var(--gutter)+9px)]">
          <Skeleton className="h-[220px] w-[170px] shrink-0 rounded-[14px] bg-raised lg:h-[374px] lg:w-[289px]" />
          <div className="w-full max-w-[560px] lg:pb-[10px]">
            <Skeleton className="h-[25px] w-[105px] rounded-full" />
            <Skeleton className="mt-4 h-11 w-[70%]" />
            <Skeleton className="mt-4 h-9 w-full" />
            <Skeleton className="mt-5 h-[25px] w-[230px] rounded-full" />
          </div>
        </div>
      </div>
      <div className="container-x pt-[33.5px]">
        <Skeleton className="h-[22px] w-[110px]" />
        <Skeleton className="mt-[37px] h-20 w-[min(602px,100%)] rounded-[16px]" />
        <Skeleton className="mt-[54px] h-[133px] w-[min(454px,100%)] rounded-[18px]" />
      </div>
    </div>
  );
}

/**
 * Film page: backdrop, poster and synopsis; the next seven days of sessions
 * grouped by venue and hall; and the details column with the rating note.
 */
export default function MovieDetails() {
  const { slug } = useParams();
  const { user, dates, reminders, notify } = useApp();
  const book = useBooking();
  const [attempt, setAttempt] = useState(0);
  const [picked, setPicked] = useState('');
  const week = useMemo(() => dates.map((d) => d.iso), [dates]);

  // Re-read after sign-in so `isNotified` belongs to the account.
  const movieState = useAsync(() => api.getMovie(slug), [slug, attempt, user?.id]);
  const movie = movieState.data?.slug === slug ? movieState.data : null;
  const playable = Boolean(movie && !movie.isComingSoon);

  // One request per day that has sessions; days the film is not showing are skipped.
  const sessionsState = useAsync(async () => {
    if (!playable) return null;
    const wanted = Array.isArray(movie.availableDates) ? week.filter((d) => movie.availableDates.includes(d)) : week;
    const days = await Promise.all(wanted.map(async (date) => [date, await api.getMovieSessions(slug, date)]));
    return { slug, days: Object.fromEntries(days) };
  }, [movie?.slug, playable, attempt]);
  const byDay = sessionsState.data?.slug === slug ? sessionsState.data.days : null;

  useEffect(() => {
    if (movie) rememberMovie(movie);
  }, [movie]);

  useEffect(() => setPicked(''), [slug]);

  const countOn = (date) => (byDay?.[date] ?? []).reduce((sum, venue) => sum + venue.sessions.length, 0);
  const total = byDay ? week.reduce((sum, date) => sum + countOn(date), 0) : 0;
  const emptyDays = byDay ? week.filter((date) => countOn(date) === 0) : [];
  // Today by default; if today is empty, the first day that has a session.
  const date = picked || week.find((d) => countOn(d) > 0) || week[0];
  const venues = byDay?.[date] ?? [];

  if (movieState.error && !movie) {
    const missing = movieState.error.status === 404;
    return (
      <div className="container-x pb-[120px] pt-[calc(var(--header-h)+24px)]">
        <StatePanel
          error
          title={missing ? 'We couldn’t find that film' : 'We couldn’t load this film'}
          text={missing ? 'It may have left the programme.' : movieState.error.message}
          actionLabel={missing ? 'Browse all sessions' : 'Try again'}
          to={missing ? '/sessions' : undefined}
          onAction={missing ? undefined : () => setAttempt((n) => n + 1)}
        />
      </div>
    );
  }
  if (!movie) return <PageSkeleton />;

  const tooYoung = isTooYoung(user, movie);
  const reminded = movie.isNotified || reminders.includes(movie.slug);
  const formats = (movie.formats ?? []).map((f) => f.name).join(', ');

  return (
    <article>
      <header className="relative overflow-hidden lg:h-[567px]">
        <Img src={movie.backdropUrl || movie.posterUrl} className="absolute inset-0 size-full object-cover object-[50%_18%]" fetchPriority="high" />
        <div aria-hidden="true" className="absolute inset-0 bg-[#070C1C]/20 backdrop-blur-[5px]" />

        <div className="container-x relative flex flex-col gap-6 pb-10 pt-[calc(var(--header-h)+16px)] sm:flex-row sm:items-end lg:gap-[34px] lg:pb-[41px] lg:pl-[calc(var(--gutter)+9px)] lg:pt-[152px]">
          <Img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fallbackLabel={movie.title}
            className="h-[220px] w-[170px] shrink-0 rounded-[14px] object-cover shadow-[0_4px_64px_rgba(0,0,0,0.2)] lg:h-[374px] lg:w-[289px]"
          />
          <div className="min-w-0 max-w-[560px] lg:pb-[10px]">
            <p className="t-body-s inline-flex h-[25px] items-center rounded-full bg-tint-red px-[11px] uppercase leading-none text-brand">
              {movie.isComingSoon ? 'Coming soon' : 'Now playing'}
            </p>
            <h1 className="t-display mt-[14px] uppercase max-lg:text-[32px] max-sm:text-[28px]">{movie.title}</h1>
            {movie.synopsis && <p className="t-body-m mt-[15.6px] text-white">{movie.synopsis}</p>}
            <MetaBadges movie={movie} compact className="mt-5" />
          </div>
        </div>
      </header>

      <div className="container-x grid gap-x-10 gap-y-12 pb-[72px] pt-[33.5px] lg:grid-cols-[minmax(0,1fr)_415px] lg:pb-[162px]">
        <section aria-labelledby="sessions-title" className="min-w-0">
          <h2 id="sessions-title" className="t-h2">
            Sessions
          </h2>

          {movie.isComingSoon ? (
            <div className="mt-[7px]">
              <p className="t-body-s text-secondary">{releaseLabel(movie.releaseDate)}. Sessions open closer to the release.</p>
              <div className="mt-[15px]">
                {reminded ? (
                  <Button variant="reminder-set" disabled aria-live="polite">
                    Reminder set
                  </Button>
                ) : (
                  <Button variant="notify" onClick={() => notify(movie.slug)}>
                    Notify Me
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="t-body-s mt-2 text-secondary" aria-live="polite">
                {byDay ? `${total} ${total === 1 ? 'session' : 'sessions'} over the next seven days` : 'Loading sessions…'}
              </p>
              <DateSelector dates={dates} value={date} onChange={setPicked} disabledDates={emptyDays} className="mt-[13.7px]" />

              {tooYoung && (
                <p role="alert" className="t-body-s mt-6 max-w-[918px] rounded-[12px] bg-tint-red px-[14px] py-3 text-brand">
                  {ageMessage(movie.ageRating.code)}
                </p>
              )}

              {sessionsState.error ? (
                <StatePanel
                  error
                  title="We couldn’t load the sessions"
                  text={sessionsState.error.message}
                  actionLabel="Try again"
                  onAction={() => setAttempt((n) => n + 1)}
                  className="mt-[26.5px] max-w-[918px]"
                />
              ) : !byDay ? (
                <div className="mt-[54px] flex flex-wrap gap-[10px]" aria-busy="true">
                  <Skeleton className="h-[133px] w-[454px] max-w-full rounded-[18px]" />
                  <Skeleton className="h-[133px] w-[454px] max-w-full rounded-[18px]" />
                </div>
              ) : venues.length === 0 ? (
                <StatePanel
                  title={total === 0 ? 'No sessions in the next seven days' : `No sessions on ${longDate(date)}`}
                  text={total === 0 ? 'Check back soon: new showtimes are added every week.' : 'Pick another day above.'}
                  className="mt-[26.5px] max-w-[918px]"
                />
              ) : (
                venues.map(({ venue, sessions }) => (
                  <section key={venue.id} aria-label={venue.name} className="mt-[26px]">
                    <h3 className="t-button">{venue.name}</h3>
                    <div className="mt-[13px] flex flex-wrap gap-[10px]">
                      {groupByHall(sessions).map(({ key, hall, sessions: shows }) => (
                        <div key={key} className="max-w-full rounded-[18px] bg-card px-[15px] pb-[15px] pt-4">
                          <p className="t-label-s pl-px">{hallLabel(hall)}</p>
                          <div className="mt-[7px] flex flex-wrap gap-[9px] pr-px">
                            {shows.map((session) => (
                              <SessionTicket key={session.id} session={{ ...session, movie }} disabled={tooYoung} onSelect={(s) => book(s, movie)} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </>
          )}
        </section>

        <aside aria-labelledby="details-title" className="min-w-0 lg:pr-[26px]">
          <h2 id="details-title" className="t-h2">
            Details
          </h2>
          <dl className="mt-[17.3px] flex flex-col gap-[16.3px]">
            {movie.director && <Detail label="Director">{movie.director}</Detail>}
            {movie.cast && <Detail label="Main cast">{movie.cast}</Detail>}
            {movie.runtimeMinutes ? <Detail label="Duration">{movie.runtimeMinutes} minutes</Detail> : null}
            {movie.releaseDate && <Detail label="Release date">{fullDate(movie.releaseDate)}</Detail>}
            {formats && <Detail label="Formats">{formats}</Detail>}
            {movie.fromPrice != null && (
              <Detail label="From">
                <Price value={movie.fromPrice} />
              </Detail>
            )}
            {/* Not drawn in the frame, required by the brief: kept last so the designed rows stay where they are. */}
            {movie.genres?.length ? <Detail label="Genre">{movie.genres.map((g) => g.name).join(', ')}</Detail> : null}
          </dl>

          {movie.ageRating && (
            <div className="mt-[17.5px] rounded-[12px] bg-tint-orange px-[14px] pb-[10.8px] pt-[8.8px] text-warning">
              <p className="t-label-s uppercase">Rating note</p>
              <p className="t-body-s mt-[5.2px] flex gap-[9px]">
                <span className="shrink-0 font-extrabold">{movie.ageRating.code}</span>
                <span>{movie.ageRating.description}</span>
              </p>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
