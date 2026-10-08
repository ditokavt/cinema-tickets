import { cn } from '../../lib/cn.js';
import { hallLabel } from '../../lib/format.js';
import Badge from '../ui/Badge.jsx';
import { TicketIcon } from '../ui/Icons.jsx';
import Price from '../ui/Price.jsx';

const LOW_SEATS = 5;

/** 252×104 showtime tile from the Sessions list. Sold-out tiles stay legible but are dimmed and inert. */
export default function SessionCard({ session, onSelect }) {
  const { isSoldOut, seatsLeft } = session;
  const low = seatsLeft <= LOW_SEATS;
  const place = `${session.venue.name} · ${hallLabel(session.hall)}`;

  return (
    <button
      type="button"
      disabled={isSoldOut}
      onClick={() => onSelect?.(session)}
      aria-label={`${session.time}, ${session.format.name}, ${session.language.name}, ${place}, ${
        isSoldOut ? 'sold out' : `${seatsLeft} seats left`
      }, ${session.price} lari`}
      className={cn(
        'flex h-[104px] w-[252px] shrink-0 flex-col rounded-[16px] bg-card px-[15px] pt-[15px] text-left transition-colors duration-150',
        isSoldOut ? 'opacity-35' : 'hover:bg-raised',
      )}
    >
      <span className="flex h-[23px] items-center justify-between">
        <span className="t-h3 text-primary">{session.time}</span>
        <Badge variant={isSoldOut ? 'tint' : 'neutral'} className={isSoldOut ? 'bg-transparent' : undefined}>
          {session.format.name}
        </Badge>
      </span>
      <span className="mt-[12px] flex items-start justify-between gap-2">
        <span className="flex min-w-0 flex-col gap-[10.5px]">
          <span className="t-body-s truncate text-secondary">{session.language.name}</span>
          <span className="t-label-s truncate text-primary">{place}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-[9.5px]">
          {isSoldOut ? (
            <span className="t-body-s leading-[13px] text-secondary">Sold out</span>
          ) : (
            <span className={cn('flex items-center gap-1 text-[12px] leading-[13px]', low ? 'text-brand' : 'text-success')}>
              <TicketIcon size={12} />
              {seatsLeft} left
            </span>
          )}
          <Price value={session.price} className="t-button text-primary" />
        </span>
      </span>
    </button>
  );
}
