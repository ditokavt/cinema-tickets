import { money } from '../../lib/format.js';
import { Lari } from './Icons.jsx';

/** "₾22" — `spaced` renders the "₾ 32" variant used for subtotals. */
export default function Price({ value, spaced = false, prefix, className }) {
  return (
    <span className={className} style={{ position: 'relative', whiteSpace: 'nowrap' }}>
      {prefix ? `${prefix} ` : null}
      <span className="sr-only">GEL </span>
      <Lari />
      {spaced ? ' ' : null}
      {money(value)}
    </span>
  );
}
