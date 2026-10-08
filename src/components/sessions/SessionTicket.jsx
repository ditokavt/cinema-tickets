import { cn } from '../../lib/cn.js';
import { languageCode } from '../../lib/format.js';
import { TicketIcon } from '../ui/Icons.jsx';
import Price from '../ui/Price.jsx';

/**
 * Ticket-shaped showtime on the film page, 207×81: time, language and format on
 * the stub, price and seats left past the perforation. The two notches take the
 * colour of whatever the ticket sits on (`surface`).
 */
export default function SessionTicket({ session, onSelect, disabled = false, surface = 'var(--bg-card)' }) {
  const soldOut = session.isSoldOut;
  const inert = soldOut || disabled;
  return (
    <button
      type="button"
      disabled={inert}
      onClick={() => onSelect?.(session)}
      aria-label={`${session.time}, ${session.format.name}, ${session.language.name}, ${
        soldOut ? 'sold out' : `${session.seatsLeft} seats left`
      }, ${session.price} lari`}
      className={cn(
        'relative flex h-[81px] w-[207px] shrink-0 rounded-[14px] bg-page text-left shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-[opacity,box-shadow] duration-150',
        inert ? 'opacity-40' : 'hover:shadow-[0_0_0_1px_var(--text-disabled)]',
      )}
    >
      <span className="flex w-[124px] flex-col items-center pt-[15px]">
        <span className="t-h2 leading-[22px] text-primary">{session.time}</span>
        <span className="mt-2 flex h-[21px] max-w-full items-center gap-[7px] px-1">
          <span className="t-body-s text-secondary">{languageCode(session.language)}</span>
          <span className="t-label-s flex h-[21px] min-w-[51px] items-center justify-center rounded-full bg-card px-2 uppercase text-[#E3E3E3]/70">
            {session.format.name}
          </span>
        </span>
      </span>

      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[124px] w-0">
        <span
          className="absolute left-[-0.75px] top-[11px] h-[59px] w-[1.5px]"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #fff 0 3px, transparent 3px 7px)' }}
        />
        <span className="absolute left-[-6px] top-[-6px] size-3 rounded-full" style={{ background: surface }} />
        <span className="absolute bottom-[-6px] left-[-6px] size-3 rounded-full" style={{ background: surface }} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col items-center pt-[15px]">
        <Price value={session.price} spaced className="t-h2 leading-[22px] text-brand" />
        <span className="t-body-s mt-3 flex items-center gap-1 text-secondary">
          <TicketIcon size={12} className="-translate-y-[2.5px]" />
          {soldOut ? 'Sold out' : `${session.seatsLeft} left`}
        </span>
      </span>
    </button>
  );
}
