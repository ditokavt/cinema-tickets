import { cn } from '../../lib/cn.js';
import Button from './Button.jsx';

/** Empty and error states share one panel: a title, a line of help and at most one action. */
export default function StatePanel({ title, text, actionLabel, onAction, to, error = false, className }) {
  return (
    <div role={error ? 'alert' : undefined} className={cn('rounded-[16px] bg-card px-6 py-10 text-center', className)}>
      <p className="t-label-m">{title}</p>
      {text && <p className="t-body-m mt-2 text-secondary">{text}</p>}
      {actionLabel && (
        <Button variant="secondary" onClick={onAction} to={to} className="mt-[22px]">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
