import { cn } from '../../lib/cn.js';
import { ChevronLeft, ChevronRight } from './Icons.jsx';

/** 1 2 [3] … 10 — always shows first, last and the neighbours of the current page. */
export function pageItems(page, last) {
  if (last <= 5) return Array.from({ length: last }, (_, i) => i + 1);
  const set = new Set([1, last, page - 1, page, page + 1]);
  if (page <= 3) [1, 2, 3].forEach((p) => set.add(p));
  if (page >= last - 2) [last - 2, last - 1, last].forEach((p) => set.add(p));
  const pages = [...set].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
  const out = [];
  pages.forEach((p, i) => {
    if (i && p - pages[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

const CELL = 'flex size-10 items-center justify-center rounded-full t-label-m transition-colors duration-150';

export default function Pagination({ page, lastPage, onChange, className }) {
  if (lastPage <= 1) return null;

  const arrow = (dir) => {
    const target = dir === 'prev' ? page - 1 : page + 1;
    const disabled = target < 1 || target > lastPage;
    const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
    return (
      <button
        type="button"
        aria-label={dir === 'prev' ? 'Previous page' : 'Next page'}
        disabled={disabled}
        onClick={() => onChange(target)}
        className={cn(CELL, 'bg-card', disabled ? 'text-disabled' : 'text-white hover:bg-raised')}
      >
        <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>
    );
  };

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-2', className)}>
      {arrow('prev')}
      {pageItems(page, lastPage).map((item, i) =>
        item === '…' ? (
          <span key={`gap-${i}`} aria-hidden="true" className={cn(CELL, 'font-normal text-white')}>
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
            className={cn(CELL, item === page ? 'bg-brand text-white' : 'text-white hover:bg-card')}
          >
            {item}
          </button>
        ),
      )}
      {arrow('next')}
    </nav>
  );
}
