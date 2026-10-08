import { useRef, useState } from 'react';
import { useDismiss } from '../../hooks/useDismiss.js';
import { cn } from '../../lib/cn.js';
import { Check, ChevronDown } from '../ui/Icons.jsx';

/** "Sort: Showtime: earliest first ⌄" */
export default function SortMenu({ options, value, onChange }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  useDismiss(ref, open, () => setOpen(false));
  const current = options.find((o) => o.id === value) ?? options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center whitespace-nowrap text-[14px] leading-normal"
      >
        <span className="text-secondary">Sort:&nbsp;</span>
        <span className="ml-[6px] font-extrabold text-primary">{current.label}</span>
        <ChevronDown size={16} strokeWidth={1.8} className={cn('ml-[8px] mr-[15px] text-white transition-transform duration-150', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Sort sessions"
          className="anim-pop absolute right-0 top-[calc(100%+10px)] z-30 w-[240px] overflow-hidden rounded-[12px] border border-raised bg-card py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        >
          {options.map((option) => (
            <li key={option.id} role="option" aria-selected={option.id === current.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className="t-label-s flex h-9 w-full items-center justify-between px-4 text-left text-primary transition-colors duration-150 hover:bg-raised"
              >
                {option.label}
                {option.id === current.id && <Check size={14} className="text-success" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
