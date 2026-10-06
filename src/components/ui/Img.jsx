import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn.js';

/**
 * Image that never shows a broken-image icon: a missing or failed source is
 * replaced by a quiet placeholder of the same size (optionally carrying the title).
 */
export default function Img({ src, alt = '', fallbackLabel, className, ...rest }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <span
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={cn('flex items-center justify-center overflow-hidden bg-raised p-2 text-center', className)}
      >
        {fallbackLabel && <span className="t-label-s line-clamp-3 uppercase text-secondary">{fallbackLabel}</span>}
      </span>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} {...rest} />;
}
