import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

/** KINO XII wordmark. size: 'md' (20px, header) | 'sm' (14px, footer) */
export default function Logo({ size = 'md', className }) {
  return (
    <Link
      to="/"
      aria-label="Kino XII — home"
      className={cn(
        'inline-flex shrink-0 items-baseline font-extrabold uppercase leading-none text-white',
        size === 'md' ? 'gap-[6px] text-[20px]' : 'gap-[4px] text-[14px]',
        className,
      )}
    >
      <span>Kino</span>
      <span className="text-brand">XII</span>
    </Link>
  );
}
