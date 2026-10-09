import Button from '../ui/Button.jsx';
import Price from '../ui/Price.jsx';
import TicketTypeSelector from './TicketTypeSelector.jsx';

/** Right column of the seats step: the chosen seats, the running subtotal and the CTA. */
export default function BookingSummary({ seats, basePrice, ticketTypes, maxSeats, subtotal, notice, busy, blocked, onTypeChange, onRemove, onNext }) {
  return (
    <div className="flex h-full flex-col">
      <h3 className="t-button">Your seats · Max {maxSeats}</h3>

      {seats.length === 0 ? (
        <p className="t-body-s mt-3 text-secondary">
          Pick up to {maxSeats} seats from the map. Each seat can carry its own ticket type.
        </p>
      ) : (
        <div className="no-scrollbar mt-3 flex flex-col gap-3 overflow-y-auto lg:max-h-[324px]">
          {seats.map((seat) => (
            <TicketTypeSelector key={seat.seatId} seat={seat} basePrice={basePrice} ticketTypes={ticketTypes} onChange={onTypeChange} onRemove={onRemove} />
          ))}
        </div>
      )}

      <div className="mt-auto pt-6">
        {notice}
        <div className="flex items-center justify-between px-[5px]">
          <span className="t-label-s uppercase text-white">Subtotal</span>
          <Price value={subtotal} spaced className="t-h1" />
        </div>
        <Button fullWidth disabled={seats.length === 0 || busy || blocked} aria-busy={busy} onClick={onNext} className="mt-3">
          {busy ? 'Holding your seats…' : 'Next: Checkout'}
        </Button>
      </div>
    </div>
  );
}
