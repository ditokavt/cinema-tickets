import { cn } from '../../lib/cn.js';

const ITEMS = [
  { label: 'Available', swatch: 'border border-disabled bg-card' },
  { label: 'Selected', swatch: 'bg-brand' },
  { label: 'Sold', swatch: 'bg-card' },
  { label: 'Held by another user', swatch: 'seat-held [background-size:auto]' },
];

export default function SeatLegend({ className }) {
  return (
    <ul className={cn('flex flex-wrap justify-center gap-x-6 gap-y-2', className)}>
      {ITEMS.map((item) => (
        <li key={item.label} className="t-body-s flex items-center gap-2 text-secondary">
          <span aria-hidden="true" className={cn('size-4 rounded-[5px]', item.swatch)} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
