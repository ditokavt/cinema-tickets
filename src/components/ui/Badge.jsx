import { cn } from '../../lib/cn.js';

/**
 * Pill badges.
 * variant: age (red on red tint) | neutral (white on raised) | tint (white on white tint)
 * size: md (21px age / 23px label) | sm (19px)
 */
const VARIANTS = {
  age: 'bg-tint-red text-brand',
  neutral: 'bg-raised text-white',
  tint: 'bg-tint text-white',
};

export default function Badge({ variant = 'neutral', size = 'md', icon, title, className, children }) {
  return (
    <span
      title={title}
      className={cn(
        't-label-s inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full',
        size === 'sm' ? 'h-[19px] px-2' : variant === 'age' ? 'h-[21px] px-2' : 'h-[23px] px-[10px]',
        VARIANTS[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
