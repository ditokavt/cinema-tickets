import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext.jsx';
import { cn } from '../../lib/cn.js';
import { X } from './Icons.jsx';

const TONE = {
  info: 'bg-raised text-white',
  error: 'bg-brand text-white',
  success: 'bg-success text-[#070C1C]',
};

/** The app's single transient message, mounted once in the layout. */
export default function Toast() {
  const { toastState, dismissToast } = useApp();
  if (!toastState) return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      <div
        key={toastState.id}
        role="status"
        aria-live="polite"
        className={cn(
          'anim-pop pointer-events-auto flex max-w-[520px] items-center gap-3 rounded-[12px] py-3 pl-4 pr-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)]',
          TONE[toastState.tone] ?? TONE.info,
        )}
      >
        <p className="t-label-s leading-[1.3]">{toastState.message}</p>
        <button type="button" aria-label="Dismiss" onClick={dismissToast} className="flex size-6 shrink-0 items-center justify-center rounded-full hover:bg-black/15">
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
