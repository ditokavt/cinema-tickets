import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { useDismiss } from '../../hooks/useDismiss.js';
import { cn } from '../../lib/cn.js';
import { displayName } from '../../lib/format.js';
import { Check, ChevronDown, LogOut, TicketIcon, User } from '../ui/Icons.jsx';
import Avatar from './Avatar.jsx';

const ITEM = 'flex h-[42px] items-center gap-2 px-5 t-label-m transition-colors duration-150 hover:bg-tint focus-visible:bg-tint';

export default function AccountDropdown() {
  const { user, profileComplete, logout } = useApp();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useDismiss(ref, open, () => setOpen(false));

  useEffect(() => setOpen(false), [location.pathname]);

  const name = displayName(user);
  const firstName = name.split(/\s+/)[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-[41px] items-center rounded-[8px] text-white"
      >
        <Avatar user={user} complete={profileComplete} size={40} />
        <span className="t-label-m ml-3 max-w-[120px] truncate max-sm:hidden">{firstName}</span>
        <ChevronDown
          size={20}
          strokeWidth={1.5}
          className={cn('-mr-px ml-2 transition-transform duration-150 sm:ml-[22px]', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="anim-pop absolute right-0 top-[calc(100%+5px)] z-50 w-[302px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[16px] bg-page pb-2 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-[10px] px-5 pt-5">
            <Avatar user={user} complete={profileComplete} />
            <div className="min-w-0">
              <p className="t-label-m truncate">{name}</p>
              <p className="t-body-s mt-[3px] truncate text-secondary">{user.email}</p>
            </div>
          </div>

          {profileComplete ? (
            <p className="t-label-m mx-5 mb-[6px] mt-4 flex h-9 items-center gap-2 rounded-[10px] bg-tint-green px-3 text-success">
              Profile Complete
              <Check size={18} strokeWidth={2.4} aria-hidden="true" />
            </p>
          ) : (
            <div className="mx-5 mb-[6px] mt-4 rounded-[10px] bg-tint-orange px-3 pb-[10.5px] pt-[9.5px]">
              <p className="t-label-m text-warning">Profile incomplete</p>
              <p className="t-body-s mt-[3px] text-secondary">Please complete your profile to enable booking</p>
            </div>
          )}

          <Link role="menuitem" to="/profile" className={ITEM}>
            <User size={16} strokeWidth={2} aria-hidden="true" />
            My Profile
          </Link>
          <Link role="menuitem" to="/profile/tickets" className={ITEM}>
            <TicketIcon size={16} />
            My Tickets
          </Link>

          <div className="mt-[5px] h-px bg-tint" />

          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
              if (location.pathname.startsWith('/profile')) navigate('/');
            }}
            className={cn(ITEM, 'w-full text-brand')}
          >
            <LogOut size={16} strokeWidth={2} className="rotate-180" aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
