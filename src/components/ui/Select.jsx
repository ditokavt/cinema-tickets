import { useId, useRef, useState } from 'react';
import { useDismiss } from '../../hooks/useDismiss.js';
import { cn } from '../../lib/cn.js';
import { Check, ChevronDown } from './Icons.jsx';

/** Field-styled dropdown: same surface as Input, chevron on the right. */
export default function Select({ label, value, onChange, options, placeholder = 'e.g. Text', className }) {
  const id = useId();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  useDismiss(ref, open, () => setOpen(false));
  const selected = value === '' || value == null ? null : options.find((o) => String(o.value) === String(value));

  return (
    <div ref={ref} className={cn('relative min-w-0', className)}>
      {label && (
        <label id={`${id}-label`} className="t-label-s mb-[9px] block leading-[14px] text-primary">
          {label}
        </label>
      )}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-[12px] border px-4 text-left text-[12px] font-semibold',
          'transition-[background-color,border-color] duration-150 hover:bg-raised',
          open ? 'border-white/25 bg-raised' : 'border-transparent bg-card',
        )}
      >
        <span className={cn('truncate', selected ? 'text-primary' : 'text-secondary')}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={18} className={cn('shrink-0 text-white transition-transform duration-150', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="anim-pop absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[12px] border border-raised bg-card py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        >
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={String(option.value) === String(value)}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex h-9 w-full items-center justify-between px-4 text-left text-[12px] font-semibold text-primary transition-colors duration-150 hover:bg-raised"
              >
                {option.label}
                {String(option.value) === String(value) && value !== '' && <Check size={14} className="text-success" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
