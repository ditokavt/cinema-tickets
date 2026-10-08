import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import MovieSessionGroup from '../components/sessions/MovieSessionGroup.jsx';
import SessionFilters, { countActiveFilters, formatsForVenues } from '../components/sessions/SessionFilters.jsx';
import SortMenu from '../components/sessions/SortMenu.jsx';
import Button from '../components/ui/Button.jsx';
import { SlidersHorizontal, X } from '../components/ui/Icons.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import StatePanel from '../components/ui/StatePanel.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useBooking } from '../hooks/useBooking.js';
import { today } from '../lib/format.js';

/**
 * URL <-> filters. The whole view lives in the address bar, so it deep-links,
 * survives a refresh and works with back / forward:
 *
 *   /sessions?venue=galleria,batumi&date=2026-11-14&format=max&sort=price_asc&page=2
 *
 * venue / format / language / time are comma-separated slugs; they are sent to
 * the API as venues[] / formats[] / languages[] / bands[].
 */
const LISTS = { venues: 'venue', formats: 'format', languages: 'language', bands: 'time' };
const DEFAULT_SORT = 'time_asc';
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '');

function readFilters(params) {
  const filters = {
    date: isDate(params.get('date')) ? params.get('date') : today(), // today is selected until another day is picked
    search: params.get('search') ?? '',
    sort: params.get('sort') ?? DEFAULT_SORT,
    page: Math.max(1, Number(params.get('page')) || 1),
  };
  Object.entries(LISTS).forEach(([key, param]) => {
    filters[key] = (params.get(param) ?? '').split(',').filter(Boolean);
  });
  return filters;
}

function writeFilters(filters) {
  const params = new URLSearchParams();
  Object.entries(LISTS).forEach(([key, param]) => {
    if (filters[key].length) params.set(param, filters[key].join(','));
  });
  if (filters.date && filters.date !== today()) params.set('date', filters.date);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort && filters.sort !== DEFAULT_SORT) params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));
  // Commas are legal in a query string; keep them readable instead of %2C.
  return params.toString().replace(/%2C/g, ',');
}

function SessionsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading sessions">
      {[5, 4, 5].map((tiles, i) => (
        <div key={i} className={i === 0 ? 'mt-[25.5px]' : 'mt-8 border-t border-raised pt-8'}>
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-14 shrink-0" />
            <div className="flex flex-col gap-[13px]">
              <Skeleton className="h-5 w-[180px]" />
              <Skeleton className="h-[14px] w-[60px]" />
            </div>
          </div>
          <div className="mt-[14px] flex gap-3 overflow-hidden">
            {Array.from({ length: tiles }, (_, n) => (
              <Skeleton key={n} className="h-[104px] w-[252px] shrink-0 rounded-[16px]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Sessions() {
  const { filterOptions, optionsError, reloadOptions, dates } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const book = useBooking();
  const [drawer, setDrawer] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const query = params.toString();
  const filters = useMemo(() => readFilters(new URLSearchParams(query)), [query]);
  const { data, error, loading } = useAsync(() => api.getSessions(filters), [query, attempt]);

  /** Any filter or sort change goes back to page 1; choosing venues drops formats they cannot show. */
  const update = useCallback(
    (patch) => {
      const next = { ...filters, page: 1, ...patch };
      if (patch.venues && filterOptions) {
        const allowed = formatsForVenues(filterOptions, next.venues).map((x) => x.slug);
        next.formats = next.formats.filter((slug) => allowed.includes(slug));
      }
      navigate({ search: writeFilters(next) });
      if ('page' in patch) window.scrollTo({ top: 0 });
    },
    [filters, filterOptions, navigate],
  );
  /** "Clear filters" empties every list and the search, and keeps the chosen day (and the sort). */
  const clear = () => navigate({ search: writeFilters({ ...readFilters(new URLSearchParams()), date: filters.date, sort: filters.sort }) });
  const active = countActiveFilters(filters);

  const sidebar = (className) =>
    filterOptions && <SessionFilters options={filterOptions} dates={dates} filters={filters} onChange={update} onClear={clear} className={className} />;

  const failure = error ?? optionsError;
  const retry = () => {
    if (optionsError) reloadOptions();
    setAttempt((n) => n + 1);
  };

  return (
    <div className="container-x pb-[72px] pt-[6px] lg:pb-[136px]">
      <h1 className="t-h1">Sessions</h1>
      <p className="t-body-m mt-[7px] text-secondary">Browse showtimes across all venues</p>

      <div className="mt-[20px] flex items-start gap-[var(--gutter)] lg:mt-[32.4px]">
        {/* Sticky: the filters stay in view while the list scrolls; a panel taller than the window scrolls inside itself. */}
        <div className="no-scrollbar sticky top-6 hidden max-h-[calc(100vh/var(--zoom)-48px)] w-[320px] shrink-0 overflow-y-auto rounded-[16px] lg:block">
          {filterOptions ? sidebar() : <Skeleton className="h-[760px] w-full rounded-[16px]" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 pt-[1.5px]">
            <p className="t-label-m" aria-live="polite">
              {loading && !data ? 'Loading sessions…' : `Showing ${data?.meta.totalSessions ?? 0} ${data?.meta.totalSessions === 1 ? 'session' : 'sessions'}`}
            </p>
            <div className="flex items-center gap-4 max-lg:-mt-2 lg:h-[15px]">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setDrawer(true)}
                leftIcon={<SlidersHorizontal size={14} aria-hidden="true" />}
                className="lg:hidden"
              >
                Filters{active ? ` · ${active}` : ''}
              </Button>
              {filterOptions && <SortMenu options={filterOptions.sorts} value={filters.sort} onChange={(sort) => update({ sort })} />}
            </div>
          </div>

          {failure && !loading ? (
            <StatePanel error title="We couldn’t load the sessions" text={failure.message} actionLabel="Try again" onAction={retry} className="mt-[25.5px]" />
          ) : loading ? (
            <SessionsSkeleton />
          ) : data?.groups.length === 0 ? (
            <StatePanel
              title="No sessions found"
              text={filters.search ? `Nothing matches “${filters.search}” on this day. Try another day, venue or format.` : 'Try another day, venue or format.'}
              actionLabel={active > 0 || filters.search ? 'Clear filters' : undefined}
              onAction={clear}
              className="mt-[25.5px]"
            />
          ) : (
            data?.groups.map((group, i) => (
              <div key={group.movie.id} className={i === 0 ? 'mt-[25.5px]' : 'mt-8 border-t border-raised pt-8'}>
                <MovieSessionGroup movie={group.movie} sessions={group.sessions} onSelect={(session) => book({ ...session, movie: session.movie ?? group.movie }, group.movie)} />
              </div>
            ))
          )}

          {!failure && !loading && data && data.groups.length > 0 && (
            <Pagination page={data.meta.currentPage} lastPage={data.meta.lastPage} onChange={(page) => update({ page })} className="mt-[52px]" />
          )}
        </div>
      </div>

      {drawer &&
        createPortal(
          <div
            className="anim-fade fixed inset-0 z-50 flex bg-black/70 lg:hidden"
            onMouseDown={(e) => e.target === e.currentTarget && setDrawer(false)}
            onKeyDown={(e) => e.key === 'Escape' && setDrawer(false)}
          >
            <div role="dialog" aria-modal="true" aria-label="Filters" className="relative h-full w-[min(352px,100vw)] overflow-y-auto bg-card">
              <button
                type="button"
                aria-label="Close filters"
                autoFocus
                onClick={() => setDrawer(false)}
                className="absolute right-4 top-[22px] flex size-7 items-center justify-center rounded-full text-white hover:bg-tint"
              >
                <X size={20} aria-hidden="true" />
              </button>
              {sidebar('rounded-none')}
              <div className="sticky bottom-0 bg-card px-6 pb-5 pt-2">
                <Button fullWidth onClick={() => setDrawer(false)}>
                  Show {data?.meta.totalSessions ?? 0} sessions
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
