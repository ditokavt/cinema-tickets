import { cn } from '../../lib/cn.js';
import { X } from '../ui/Icons.jsx';
import Price from '../ui/Price.jsx';

/**
 * One selected seat (321×103): its code, price and remove button over the
 * ticket-type switch. `ticketTypes` is the list this title allows (GET
 * /filter-options, minus any type blocked for its age rating), cheapest first.
 */
export default function TicketTypeSelector({ seat, basePrice, ticketTypes, onChange, onRemove }) {
  const current = ticketTypes.find((t) => t.slug === seat.type) ?? ticketTypes[ticketTypes.length - 1];
  return (
    <div className="rounded-[16px] bg-card px-[15px] pb-[15px]">
      <div className="flex h-[44px] items-center justify-between border-b border-raised pt-[2px]">
        <p className="t-body-s pl-px text-secondary">
          Seat <span className="t-label-s ml-[10px] text-primary">{seat.code}</span>
        </p>
        <div className="flex items-center gap-[9px]">
          <Price value={basePrice * current.priceRatio} className="t-button text-primary" />
          <button
            type="button"
            aria-label={`Remove seat ${seat.code}`}
            onClick={() => onRemove(seat.seatId)}
            className="-mr-1 flex size-6 items-center justify-center rounded-full text-secondary transition-colors duration-150 hover:bg-tint hover:text-white"
          >
            <X size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        className="mt-3 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${ticketTypes.length}, minmax(0, 1fr))` }}
        role="radiogroup"
        aria-label={`Ticket type for seat ${seat.code}`}
      >
        {ticketTypes.map((type) => {
          const active = type.slug === current.slug;
          return (
            <button
              key={type.slug}
              type="button"
              role="radio"
              aria-checked={active}
              title={type.note ?? undefined}
              onClick={() => onChange(seat.seatId, type.slug)}
              className={cn(
                't-label-s flex h-8 items-center justify-center whitespace-nowrap rounded-full transition-colors duration-150',
                active ? 'bg-brand text-white' : 'bg-raised text-white hover:bg-disabled',
              )}
            >
              {type.name} {Math.round(type.priceRatio * 100)}%
            </button>
          );
        })}
      </div>
    </div>
  );
}
