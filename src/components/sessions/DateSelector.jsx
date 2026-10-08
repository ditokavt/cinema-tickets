import { cn } from '../../lib/cn.js';

/**
 * Day chips. `compact` is the 37×54 strip in the Sessions sidebar; the default
 * is the 80×80 chip on the film page. A day in `disabledDates` has no sessions.
 * Clicking the selected day clears it when `clearable` is set.
 */
export default function DateSelector({ dates, value, onChange, compact = false, clearable = false, disabledDates = [], className }) {
  return (
    <div role="group" aria-label="Date" className={cn('no-scrollbar relative flex overflow-x-auto', compact ? 'gap-[6px]' : 'gap-[7px]', className)}>
      {dates.map((d) => {
        const selected = d.iso === value;
        const empty = disabledDates.includes(d.iso);
        return (
          <button
            key={d.iso}
            type="button"
            aria-pressed={selected}
            aria-label={`${d.weekdayLong} ${d.day} ${d.monthLong}${empty ? ', no sessions' : ''}`}
            onClick={() => onChange(selected && clearable ? '' : d.iso)}
            className={cn(
              'flex shrink-0 flex-col items-center transition-colors duration-150',
              compact ? 'h-[54px] w-[37px] justify-center gap-[6px] rounded-[8px]' : 'size-20 gap-[5px] rounded-[16px] pt-5',
              selected ? 'bg-brand text-white' : compact ? 'bg-raised text-white hover:bg-white/15' : 'bg-card text-white hover:bg-raised',
              empty && !selected && 'text-disabled',
            )}
          >
            <span className="t-label-s">{d.weekday}</span>
            <span className={compact ? 't-label-s' : 't-h3'}>{d.day}</span>
          </button>
        );
      })}
    </div>
  );
}
