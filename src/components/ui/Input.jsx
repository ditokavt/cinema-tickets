import { forwardRef, useId } from 'react';
import { cn } from '../../lib/cn.js';
import { Check, CircleAlert } from './Icons.jsx';

/**
 * Input system (Universal components.pdf).
 * States: default · hover · focused · filled · success · error · disabled.
 *
 * error:   string -> red border, label, text and helper, alert icon
 * success: true   -> green check on the right
 * helper:  string -> grey line under the field
 */
const Input = forwardRef(function Input(
  { label, error, success = false, helper, rightSlot, className, inputClassName, disabled, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-msg`;
  const hasError = Boolean(error);
  const message = hasError ? error : helper;

  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <label htmlFor={inputId} className={cn('t-label-s mb-[9px] block leading-[14px]', hasError ? 'text-brand' : 'text-primary')}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            'block h-10 w-full min-w-0 rounded-[12px] border bg-card px-4 text-[12px] font-semibold leading-none outline-none',
            'transition-[background-color,border-color] duration-150 placeholder:font-semibold',
            hasError
              ? 'border-brand text-brand placeholder:text-brand'
              : 'border-transparent text-primary focus:border-white/25 focus:bg-raised enabled:hover:bg-raised',
            disabled && 'cursor-not-allowed text-secondary',
            (hasError || success || rightSlot) && 'pr-11',
            inputClassName,
          )}
          {...rest}
        />
        <span className={cn('pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center', hasError ? 'right-[17px]' : 'right-4')}>
          {hasError ? (
            <CircleAlert size={14} className="text-brand" aria-hidden="true" />
          ) : success ? (
            <Check size={16} strokeWidth={2.4} className="text-success" aria-hidden="true" />
          ) : null}
        </span>
        {!hasError && !success && rightSlot && (
          <span className="absolute right-[10px] top-1/2 flex -translate-y-1/2 items-center">{rightSlot}</span>
        )}
      </div>
      {message && (
        <p id={messageId} className={cn('t-label-s mt-[7px]', hasError ? 'leading-[14px] text-brand' : 'mb-1 leading-[15.6px] text-secondary')}>
          {message}
        </p>
      )}
    </div>
  );
});

export default Input;
