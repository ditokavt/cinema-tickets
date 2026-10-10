import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

/** Personal Information / My Tickets with the red count badge and underline. */
export default function ProfileTabs({ ticketCount }) {
  const tab = ({ isActive }) =>
    cn(
      't-label-m relative flex items-center gap-2 px-[2px] pb-4 transition-colors duration-150',
      'after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full',
      isActive ? 'text-primary after:bg-brand' : 'text-secondary hover:text-primary',
    );

  return (
    <nav aria-label="Profile sections" className="flex gap-8 border-b-2 border-card">
      <NavLink to="/profile" end className={tab}>
        Personal Information
      </NavLink>
      <NavLink to="/profile/tickets" className={tab}>
        My Tickets
        {ticketCount > 0 && (
          <span className="t-label-s flex h-[17px] min-w-[19px] items-center justify-center rounded-full bg-brand px-[6px] text-white">
            {ticketCount}
          </span>
        )}
      </NavLink>
    </nav>
  );
}
