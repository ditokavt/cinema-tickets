import { cn } from '../../lib/cn.js';
import { Check } from './Icons.jsx';

/** 18px rounded checkbox with the red checked state from the filters sidebar. */
export default function Checkbox({ checked, onChange, children, hint, className }) {
  return (
    <label className={cn('group relative flex h-[18px] cursor-pointer items-center', className)}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          'flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors duration-150',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white',
          checked ? 'border-brand bg-brand' : 'border-disabled group-hover:border-secondary',
        )}
      >
        {checked && <Check size={12} strokeWidth={3.4} className="text-white" />}
      </span>
      <span className="t-label-m ml-[10px] text-primary">{children}</span>
      {hint && <span className="t-body-s ml-[5px] leading-none text-secondary">· {hint}</span>}
    </label>
  );
}
