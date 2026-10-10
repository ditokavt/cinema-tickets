import { useEffect, useState } from 'react';
import { hallLabel, shiftDateTime, shortDate } from '../../lib/format.js';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Img from '../ui/Img.jsx';
import Price from '../ui/Price.jsx';

const REFUND_CUTOFF_MINUTES = 120; // display only; the button itself follows order.isRefundable

function Meta({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="t-overline text-secondary">{label}</dt>
      <dd className="t-label-m mt-[3px] text-primary">{children}</dd>
    </div>
  );
}

/**
 * Order card on My Tickets (My Profile.pdf): film, date, venue, format, seats
 * on the left; order number, total and refund on the stub.
 *
 * Refund is enabled only when the API says `isRefundable`, and asks for a
 * second click because a refund cannot be undone. Past and refunded orders
 * keep the button, switched off, with the reason underneath.
 */
export default function TicketCard({ order, onRefund, busy = false }) {
  const [confirming, setConfirming] = useState(false);
  const { session } = order;
  const movie = session.movie;
  const refunded = Boolean(order.refundedAt) || order.status === 'refunded';
  const canRefund = order.isRefundable && !refunded;
  const until = shiftDateTime(session.date, session.time, -REFUND_CUTOFF_MINUTES);

  useEffect(() => {
    if (!confirming) return undefined;
    const timer = setTimeout(() => setConfirming(false), 5000);
    return () => clearTimeout(timer);
  }, [confirming]);

  // Why the button is off, shown under it. The decision itself is the API's `isRefundable`.
  const blockedReason = refunded
    ? 'Refunded'
    : !order.isUpcoming
      ? 'Session has already taken place'
      : !order.isRefundable
        ? 'Refunds close 2 hours before the session'
        : '';

  return (
    <article className="flex flex-col rounded-[24px] bg-card md:min-h-[183px] md:flex-row">
      <div className="flex min-w-0 flex-1 items-center gap-[18px] px-5 py-5 md:py-[24.75px] md:pl-[30px] md:pr-6">
        <Img
          src={movie.posterUrl}
          className="h-[107px] w-20 shrink-0 self-start rounded-[10px] bg-raised object-cover sm:h-[133.5px] sm:w-[100px] sm:self-center"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-[11px] gap-y-1">
            <h3 className="t-h2">{movie.title}</h3>
            <Badge variant="age" size="sm" title={movie.ageRating.description}>
              {movie.ageRating.code}
            </Badge>
            <span className="t-body-m -ml-px text-secondary">{movie.runtimeMinutes} min</span>
          </div>
          <dl className="mt-[12px] flex flex-wrap gap-x-[41px] gap-y-3">
            <Meta label="Date">
              {shortDate(session.date)} · {session.time}
            </Meta>
            <Meta label="Venue">
              {session.venue.name} · {hallLabel(session.hall)}
            </Meta>
            <Meta label="Format">
              {session.format.name} · {session.language.name}
            </Meta>
          </dl>
          <div className="mt-[12px] flex flex-wrap items-center gap-2">
            <span className="t-overline text-secondary">Seats</span>
            {order.tickets.map((ticket) => (
              <span key={ticket.id} className="t-label-s flex h-[21px] items-center rounded-[6px] bg-tint px-[10px] text-white">
                {ticket.seatCode} · {ticket.ticketType.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="dashed-h mx-5 h-px md:hidden" />
      <div aria-hidden="true" className="dashed-v hidden w-px md:block" />

      <div className="shrink-0 px-5 pb-5 pt-4 md:w-[300px] md:pb-5 md:pl-[25px] md:pr-6 md:pt-5">
        <p className="t-overline text-secondary">Order</p>
        <p className="t-label-m mt-px text-primary">#{order.reference}</p>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="t-label-m text-secondary">Total paid</span>
          <Price value={order.totalPrice} className="t-h1" />
        </div>
        {confirming ? (
          <Button
            size="sm"
            fullWidth
            disabled={busy}
            onClick={() => {
              setConfirming(false);
              onRefund?.(order);
            }}
            className="mt-[9.5px]"
          >
            Confirm refund
          </Button>
        ) : (
          <Button variant="secondary" size="sm" fullWidth disabled={!canRefund || busy} title={blockedReason || undefined} onClick={() => setConfirming(true)} className="mt-[9.5px]">
            Refund
          </Button>
        )}
        <p className="t-body-s mt-[10px] text-center text-secondary" aria-live="polite">
          {busy ? 'Refunding…' : blockedReason || (confirming ? 'This cannot be undone' : `Refundable until ${until.time}, ${shortDate(until.date)}`)}
        </p>
      </div>
    </article>
  );
}
