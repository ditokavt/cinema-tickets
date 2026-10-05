/**
 * Icons. Lucide covers the generic line icons; the two glyphs the design draws
 * itself (the solid ticket and the lari sign) are reproduced here.
 */
export {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  LogOut,
  Popcorn,
  Search,
  SlidersHorizontal,
  Timer,
  Upload,
  User,
  X,
} from 'lucide-react';

/** Solid, tilted ticket used for "seats left" and "My Tickets". */
export function TicketIcon({ size = 16, className, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className} {...rest}>
      <g transform="rotate(-38 8 8)">
        <path d="M2.2 3.2h4.3a1.5 1.5 0 0 0 3 0h4.3c.66 0 1.2.54 1.2 1.2v7.2c0 .66-.54 1.2-1.2 1.2H9.5a1.5 1.5 0 0 0-3 0H2.2c-.66 0-1.2-.54-1.2-1.2V4.4c0-.66.54-1.2 1.2-1.2Z" />
      </g>
    </svg>
  );
}

/**
 * Georgian lari sign. Archivo ships no U+20BE, so it is drawn to match the
 * weight of the ExtraBold figures it sits next to. Sized in em, sits on the baseline.
 */
export function Lari({ className }) {
  return (
    <svg
      viewBox="0 0 18 24"
      width="0.62em"
      height="0.83em"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'baseline', overflow: 'visible' }}
    >
      <path d="M1 21.7h16" strokeWidth="4.6" />
      <path d="M15.9 12.5A6.6 6.6 0 1 0 9.3 19.2" strokeWidth="4.6" />
      <path d="M6.9 0.5v10.5M11.5 0.5v10.5" strokeWidth="2.7" />
    </svg>
  );
}
