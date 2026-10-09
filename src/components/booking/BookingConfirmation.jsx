import { hallLabel, shortDate, ticketBreakdown } from '../../lib/format.js';
import Button from '../ui/Button.jsx';
import { Check } from '../ui/Icons.jsx';
import Img from '../ui/Img.jsx';
import Price from '../ui/Price.jsx';

/** Final state of the booking modal, rendered from the order the API stored rather than from local state. */
export default function BookingConfirmation({ order, onHome }) {
  const { session } = order;
  return (
    <div className="flex flex-col items-center px-5 pb-10 pt-10 text-center sm:px-8 lg:min-h-[599px] lg:pb-14 lg:pt-14">
      <span className="flex size-14 items-center justify-center rounded-full bg-success text-white">
        <Check size={32} strokeWidth={3} aria-hidden="true" />
      </span>
      <h2 id="booking-title" className="t-h1 mt-[15px]">
        Booking confirmed!
      </h2>
      <p className="t-body-m mt-[11px] max-w-[360px] text-secondary">Your tickets are ready. We’ve sent the confirmation to your email.</p>
      <p className="t-label-s mt-4 flex h-[26px] items-center rounded-full bg-raised px-[41.5px] uppercase text-white">Order #{order.reference}</p>

      <div className="mt-[18px] w-full max-w-[673px] rounded-[12px] bg-card px-5 pb-5 pt-5 text-left">
        <div className="flex items-start gap-[10px]">
          <Img src={session.movie.posterUrl} className="h-16 w-12 shrink-0 rounded-[8px] object-cover" />
          <div className="min-w-0">
            <p className="t-button truncate uppercase">{session.movie.title}</p>
            <p className="t-body-s mt-2 pl-px text-secondary">
              {session.venue.name} · {hallLabel(session.hall)} · {shortDate(session.date)} · {session.time}
            </p>
          </div>
        </div>
        <dl className="mt-3 flex flex-col gap-[12.1px] border-t border-raised pt-3">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="t-body-s pl-px text-secondary">Seats</dt>
            <dd className="t-label-s text-right leading-[15.6px] text-primary">{order.tickets.map((t) => t.seatCode).join(', ')}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="t-body-s pl-px text-secondary">Tickets</dt>
            <dd className="t-label-s text-right leading-[15.6px] text-primary">{ticketBreakdown(order.tickets.map((t) => t.ticketType.name))}</dd>
          </div>
        </dl>
        <div className="mt-[12.7px] flex h-[32px] items-end justify-between border-t border-raised">
          <span className="t-body-s pb-[2px] pl-px uppercase text-secondary">Total paid</span>
          <Price value={order.totalPrice} spaced className="t-h3" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button to="/profile/tickets">View my tickets</Button>
        <Button variant="secondary" onClick={onHome}>
          Back to home
        </Button>
      </div>
    </div>
  );
}
