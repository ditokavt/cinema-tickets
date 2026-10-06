import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn.js';

/**
 * A single row of cards that scrolls sideways: wheel / trackpad, touch, keyboard,
 * and click-and-drag with a mouse. While there is more to the right the edge
 * fades out, as in the design; at the end of the row the fade lifts.
 */
export default function ScrollRow({ children, gap = 20, fade = true, label, className }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const [atEnd, setAtEnd] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [children]);

  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    d.moved = true;
    ref.current.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    if (!d) return;
    // Keep the flag for one tick so the click that ends a drag can be swallowed.
    setTimeout(() => {
      drag.current = null;
    }, 0);
    if (!d.moved) drag.current = null;
  };

  return (
    <div className={cn('relative', className)}>
      <div
        ref={ref}
        role="list"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => {
          if (drag.current?.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="no-scrollbar relative -mb-2 flex overflow-x-auto pb-2 outline-none focus-visible:outline-none"
        style={{ gap }}
      >
        {children}
      </div>
      {fade && !atEnd && <span aria-hidden="true" className="row-fade pointer-events-none absolute inset-y-0 right-0 w-[147px] max-sm:w-10" />}
    </div>
  );
}
