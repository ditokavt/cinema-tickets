import { cn } from '../../lib/cn.js';

/** Upcoming / Past segmented control with counts. */
export default function TicketTabs({ value, onChange, counts }) {
  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
  ];
  return (
    <div role="tablist" aria-label="Tickets" className="inline-flex h-[39px] items-center rounded-[12px] bg-card p-[5px]">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              't-label-m flex h-[29px] items-center gap-[8.5px] rounded-[10px] px-[14px] transition-colors duration-150',
              active ? 'bg-raised text-primary' : 'text-secondary hover:text-primary',
            )}
          >
            {tab.label}
            <span className={cn('t-label-s', active ? 'text-primary' : 'text-disabled')}>{counts[tab.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
