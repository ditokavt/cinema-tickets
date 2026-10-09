import { hallLabel, shortDate, ticketBreakdown } from '../../lib/format.js';

/** "Summary" card on the checkout step (321×134), built from the hold the API returned. */
export default function OrderSummary({ session, hold }) {
  return (
    <div className="rounded-[12px] bg-card px-4 pb-[16.7px] pt-4">
      <p className="t-button truncate uppercase">{session.movie.title}</p>
      <p className="t-body-s mt-[7.7px] pl-px text-secondary">
        {hallLabel(session.hall)} · {shortDate(session.date)} · {session.time}
      </p>
      <dl className="mt-[10.7px] flex flex-col gap-[10.1px] border-t border-raised pt-[10px]">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="t-body-s text-secondary">Seats</dt>
          <dd className="t-label-s text-right leading-[15.6px] text-primary">{hold.seats.map((s) => s.code).join(', ')}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="t-body-s text-secondary">Tickets</dt>
          <dd className="t-label-s text-right leading-[15.6px] text-primary">{ticketBreakdown(hold.seats.map((s) => s.ticketType.name))}</dd>
        </div>
      </dl>
    </div>
  );
}
