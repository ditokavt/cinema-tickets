import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible overlay: dimmed backdrop, Escape and backdrop-click to close,
 * focus is trapped inside and handed back to the trigger on close.
 */
export default function Modal({ open, onClose, labelledBy, bordered = true, className, children }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const panel = panelRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    (panel?.querySelector('[data-autofocus]') ?? panel)?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="anim-fade fixed inset-0 z-50 overflow-y-auto bg-black/70"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget || e.target.dataset.backdrop) onCloseRef.current?.();
      }}
    >
      <div data-backdrop="true" className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          className={cn('relative w-full rounded-[28px] bg-page outline-none', bordered && 'border border-raised', className)}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
