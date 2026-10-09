import { cn } from '../../lib/cn.js';

const STATE = {
  available: 'border border-disabled bg-card text-white hover:border-secondary hover:text-[18px]',
  selected: 'border border-brand bg-brand text-white',
  sold: 'bg-card text-disabled',
  held: 'seat-held text-secondary',
};

const SPOKEN = { available: 'available', selected: 'selected', sold: 'sold', held: 'held by another user' };

/**
 * One seat, sized by --seat (52px in the designs).
 * status: available | selected | sold | held | unavailable
 * `unavailable` is a gap in the hall: it keeps its space so the row stays aligned, but draws nothing.
 */
export default function Seat({ seat, status, onToggle }) {
  if (status === 'unavailable') return <span aria-hidden="true" className="size-[var(--seat)] shrink-0" />;

  const inert = status === 'sold' || status === 'held';
  return (
    <button
      type="button"
      disabled={inert}
      aria-pressed={status === 'selected'}
      aria-label={`Seat ${seat.code}, ${SPOKEN[status]}`}
      onClick={() => onToggle(seat)}
      className={cn(
        't-button flex size-[var(--seat)] shrink-0 items-center justify-center rounded-[10px] transition-[background-color,border-color,font-size] duration-150',
        STATE[status],
      )}
    >
      {seat.label}
    </button>
  );
}
