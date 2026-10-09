import { cn } from '../../lib/cn.js';

const STEPS = [
  { id: 'seats', label: 'Seats' },
  { id: 'checkout', label: 'Checkout' },
];

/** Two-step SEATS / CHECKOUT bar ("Progress" component). */
export default function BookingProgress({ step, onBack }) {
  return (
    <ol className="relative grid h-[33px] grid-cols-2 rounded-full bg-card">
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-0 w-[calc(50%-4px)] rounded-full bg-brand transition-[left] duration-200 ease-out',
          step === 'seats' ? 'left-0' : 'left-[calc(50%+4px)]',
        )}
      />
      {STEPS.map((s) => {
        const current = s.id === step;
        const canGoBack = s.id === 'seats' && step === 'checkout';
        const label = <span className="t-label-s uppercase text-white">{s.label}</span>;
        return (
          <li key={s.id} aria-current={current ? 'step' : undefined} className="relative flex items-center justify-center">
            {canGoBack ? (
              <button type="button" onClick={onBack} className="flex size-full items-center justify-center rounded-full" aria-label="Back to seats">
                {label}
              </button>
            ) : (
              label
            )}
          </li>
        );
      })}
    </ol>
  );
}
