import { cn } from '../../lib/cn.js';

/** Shimmering placeholder block. Size and radius come from `className`. */
export default function Skeleton({ className, style }) {
  return <span aria-hidden="true" className={cn('skeleton block', className)} style={style} />;
}
