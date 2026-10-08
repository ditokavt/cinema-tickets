import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../api';
import { useDismiss } from '../../hooks/useDismiss.js';
import { cn } from '../../lib/cn.js';
import { Search, X } from '../ui/Icons.jsx';
import SearchResults, { SearchEmpty, SearchPrompt } from './SearchResults.jsx';

/**
 * Header search. Resting: 380×41 pill. Open: grows to 480 and drops the
 * prompt / results / no-results panel beneath it (Overlays.pdf).
 * `fluid` fills its parent instead (tablet and mobile second row).
 */
export default function SearchOverlay({ fluid = false, className }) {
  const ref = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ query: '', results: [] });
  const location = useLocation();

  const close = () => setOpen(false);
  useDismiss(ref, open, close);

  // Navigating anywhere closes and clears the overlay.
  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [location.pathname, location.search]);

  // Debounced lookup against /search.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setState({ query: '', results: [] });
      return undefined;
    }
    let alive = true;
    const timer = setTimeout(() => {
      api
        .search(q)
        .then((results) => alive && setState({ query: q, results: results ?? [] }))
        .catch(() => alive && setState({ query: q, results: [] }));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query]);

  const trimmed = query.trim();
  const settled = state.query === trimmed;

  return (
    <div ref={ref} role="search" className={cn('relative h-[41px]', !fluid && 'w-[380px]', className)}>
      <div
        className={cn(
          'absolute right-0 top-0 transition-[width] duration-200 ease-out',
          fluid ? 'w-full' : open ? 'w-[480px]' : 'w-[380px]',
        )}
      >
        <label
          className={cn(
            'flex h-[41px] cursor-text items-center rounded-full border-2 bg-tint transition-colors duration-150',
            open ? 'border-tint pl-[11px] pr-[7px]' : 'border-transparent pl-3 pr-3 hover:bg-white/15',
          )}
        >
          {/* Open and empty, the design drops the icon and shows only the caret. */}
          <span
            className={cn(
              'flex shrink-0 items-center overflow-hidden transition-[width,opacity] duration-150',
              !open ? 'w-4' : query ? 'w-[22px]' : 'w-[14px] opacity-0',
            )}
          >
            <Search size={open ? 14 : 12} strokeWidth={2.2} className="shrink-0 text-white" aria-hidden="true" />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search films and live events"
            aria-label="Search films and live events"
            autoComplete="off"
            className={cn(
              't-body-m min-w-0 flex-1 bg-transparent leading-none text-white outline-none placeholder:text-white',
              open && 'placeholder:opacity-25',
            )}
          />
          {open && query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-tint text-white transition-colors duration-150 hover:bg-white/20"
            >
              <X size={13} strokeWidth={2.6} aria-hidden="true" />
            </button>
          )}
        </label>

        {open && (
          <div className="anim-pop absolute left-0 right-0 top-[46px] rounded-[16px] border-2 border-raised bg-page shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
            {!trimmed ? (
              <SearchPrompt onNavigate={close} />
            ) : !settled ? (
              <div className="h-[120px]" aria-busy="true" />
            ) : state.results.length ? (
              <SearchResults query={trimmed} results={state.results} onNavigate={close} />
            ) : (
              <SearchEmpty query={trimmed} onNavigate={close} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
