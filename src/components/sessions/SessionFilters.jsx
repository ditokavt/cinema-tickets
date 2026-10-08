import { cn } from '../../lib/cn.js';
import { splitBandLabel } from '../../lib/format.js';
import Button from '../ui/Button.jsx';
import Checkbox from '../ui/Checkbox.jsx';
import DateSelector from './DateSelector.jsx';

const toggle = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

/** The date is always set (today by default), so it is not counted and "Clear filters" leaves it alone. */
export const countActiveFilters = (f) => f.venues.length + f.formats.length + f.languages.length + f.bands.length;

/** Formats the selected venues can actually show (all formats when no venue is selected). */
export function formatsForVenues(options, venueSlugs) {
  if (!venueSlugs.length) return options.formats;
  const allowed = new Set(options.venues.filter((v) => venueSlugs.includes(v.slug)).flatMap((v) => v.formats.map((x) => x.slug)));
  return options.formats.filter((x) => allowed.has(x.slug));
}

function Section({ title, first = false, children }) {
  return (
    <fieldset className={first ? 'relative min-w-0 pb-6' : 'relative min-w-0 border-t border-raised pb-6 pt-6'}>
      <legend className="sr-only">{title}</legend>
      <p aria-hidden="true" className="t-overline mb-[11px] text-secondary">
        {title}
      </p>
      {children}
    </fieldset>
  );
}

function CheckList({ items, selected, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <Checkbox key={item.value} checked={selected.includes(item.value)} onChange={() => onChange(toggle(selected, item.value))} hint={item.hint}>
          {item.label}
        </Checkbox>
      ))}
    </div>
  );
}

/**
 * Filters sidebar (Sessions.pdf). Fully controlled: every list comes from
 * GET /filter-options and every change is handed back through `onChange`.
 * Array filters carry slugs, which is what the API and the URL use.
 */
export default function SessionFilters({ options, dates, filters, onChange, onClear, className }) {
  const active = countActiveFilters(filters);
  const formats = formatsForVenues(options, filters.venues);

  return (
    <aside aria-label="Filters" className={cn('rounded-[16px] bg-card px-6 pt-6', className)}>
      <h2 className="t-h3 mb-6">Filters</h2>

      <Section title="Venue" first>
        <CheckList
          items={options.venues.map((v) => ({ value: v.slug, label: v.name, hint: v.city }))}
          selected={filters.venues}
          onChange={(venues) => onChange({ venues })}
        />
      </Section>

      <Section title="Date">
        <DateSelector compact dates={dates} value={filters.date} onChange={(date) => onChange({ date })} />
      </Section>

      <Section title="Format">
        <CheckList
          items={formats.map((x) => ({ value: x.slug, label: x.name }))}
          selected={filters.formats}
          onChange={(next) => onChange({ formats: next })}
        />
      </Section>

      <Section title="Language">
        <CheckList
          items={options.languages.map((l) => ({ value: l.slug, label: l.name }))}
          selected={filters.languages}
          onChange={(languages) => onChange({ languages })}
        />
      </Section>

      <Section title="Time of day">
        <CheckList
          items={options.timeBands.map((b) => {
            const { name, hint } = splitBandLabel(b.label);
            return { value: b.id, label: name, hint };
          })}
          selected={filters.bands}
          onChange={(bands) => onChange({ bands })}
        />
      </Section>

      <div className={cn('border-t border-raised pt-[23.5px] text-center', active ? 'pb-[18.5px]' : 'pb-[24.5px]')}>
        {active > 0 ? (
          <Button variant="outline" fullWidth onClick={onClear} className="h-8 text-[12px] font-semibold">
            Clear filters
          </Button>
        ) : (
          <div className="h-[26px]" />
        )}
        <p className="t-body-s mt-[11.5px] text-secondary" aria-live="polite">
          {active} filters active
        </p>
      </div>
    </aside>
  );
}
