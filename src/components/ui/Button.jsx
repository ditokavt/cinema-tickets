import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';
import { Bell, Check } from './Icons.jsx';

/**
 * Button system (Universal components.pdf).
 *
 * variant: primary | white | secondary | outline | tertiary | text | notify | reminder-set
 * size:    md (41px) | sm (35px) | xs (32px); notify / reminder-set are the 28px outline pill
 * Disabled primary/white/secondary all collapse to the single muted treatment in the design.
 */
const BASE =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full select-none ' +
  'transition-[background-color,color,border-color,opacity] duration-150';

const SIZES = {
  md: 'h-[41px] px-[22px] t-button',
  sm: 'h-[35px] px-[22px] t-button',
  xs: 'h-8 px-[18px] t-button',
};

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-[#D62A10] active:bg-[#C2250D]',
  white: 'bg-white text-[#070C1C] hover:bg-white/90 active:bg-white/80',
  secondary: 'bg-tint text-white hover:bg-white/15 active:bg-white/20',
  outline: 'border border-secondary text-white hover:border-white hover:bg-tint',
  tertiary: 'rounded-[6px] bg-card text-white hover:bg-raised',
  text: 'px-0 text-white hover:text-secondary',
  notify: 'h-7 gap-[5.5px] border border-secondary pl-[11px] pr-3 text-[12px] font-semibold text-white hover:border-white hover:bg-tint',
  'reminder-set': 'h-7 gap-[5.5px] bg-tint pl-3 pr-[13px] text-[12px] font-semibold text-white',
};

const DISABLED = {
  primary: 'bg-disabled text-secondary',
  white: 'bg-disabled text-secondary',
  secondary: 'bg-white/[0.02] text-disabled',
  outline: 'border border-disabled text-disabled',
  tertiary: 'rounded-[6px] bg-card text-disabled',
  text: 'px-0 text-disabled',
  notify: 'h-7 gap-[5.5px] border border-disabled pl-[11px] pr-3 text-[12px] font-semibold text-disabled',
  'reminder-set': 'h-7 gap-[5.5px] bg-tint pl-3 pr-[13px] text-[12px] font-semibold text-white',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  to,
  leftIcon,
  rightIcon,
  className,
  children,
  type = 'button',
  ...rest
}) {
  const pill = variant === 'notify' || variant === 'reminder-set'; // fixed 28px pill, not sized by `size`
  const classes = cn(
    BASE,
    !pill && SIZES[size],
    disabled ? DISABLED[variant] : VARIANTS[variant],
    fullWidth && 'w-full',
    disabled && 'cursor-not-allowed',
    className,
  );

  const content = (
    <>
      {variant === 'notify' && <Bell size={15} strokeWidth={1.9} aria-hidden="true" />}
      {variant === 'reminder-set' && <Check size={15} strokeWidth={2.4} aria-hidden="true" />}
      {leftIcon}
      {children}
      {rightIcon}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {content}
    </button>
  );
}
