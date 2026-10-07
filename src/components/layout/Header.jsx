import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import AccountDropdown from '../auth/AccountDropdown.jsx';
import SearchOverlay from '../search/SearchOverlay.jsx';
import { cn } from '../../lib/cn.js';
import Button from '../ui/Button.jsx';
import Logo from './Logo.jsx';

/** `overlay` lays the header over the hero image instead of above the page. */
export default function Header({ overlay = false }) {
  const { user, authReady, openAuth } = useApp();

  return (
    <header className={cn('header-fade z-40', overlay ? 'absolute inset-x-0 top-0' : 'relative')}>
      <div className="mx-auto flex max-w-[var(--frame)] flex-wrap items-center gap-y-3 px-[var(--header-pad)] py-4 lg:h-[111px] lg:flex-nowrap lg:items-start lg:pb-0 lg:pt-[30px]">
        <div className="flex h-[41px] items-center gap-5 sm:gap-9">
          <Logo />
          <NavLink to="/sessions" className="t-overline text-white transition-colors duration-150 hover:text-secondary">
            Sessions
          </NavLink>
        </div>

        <div className="ml-auto flex h-[41px] items-center gap-8">
          <SearchOverlay className="hidden lg:block" />
          {!authReady ? null : user ? (
            <AccountDropdown />
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={() => openAuth('signup')} className="max-sm:hidden">
                Sign up
              </Button>
              <Button variant="white" onClick={() => openAuth('login')}>
                Log in
              </Button>
            </div>
          )}
        </div>

        <SearchOverlay fluid className="w-full lg:hidden" />
      </div>
    </header>
  );
}
