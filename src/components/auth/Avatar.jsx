import { cn } from '../../lib/cn.js';
import { displayName, initials } from '../../lib/format.js';

/** Rounded-square avatar with the profile status dot (orange incomplete, green complete). */
export default function Avatar({ user, complete, size = 42, className }) {
  return (
    <span className={cn('relative block shrink-0', className)} style={{ width: size, height: size }}>
      {user.avatar ? (
        <img src={user.avatar} alt="" className="size-full rounded-[8px] object-cover" />
      ) : (
        <span className="t-label-s flex size-full items-center justify-center rounded-[8px] bg-card text-white">{initials(displayName(user))}</span>
      )}
      <span
        aria-hidden="true"
        className={cn('absolute -bottom-px -right-px size-[10px] rounded-full border border-[#070C1C]', complete ? 'bg-success' : 'bg-warning')}
      />
    </span>
  );
}
