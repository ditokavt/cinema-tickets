import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AuthModals from '../auth/AuthModals.jsx';
import Toast from '../ui/Toast.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';

/** Routes whose first block is a full-bleed image: the header floats over it. */
const overHero = (pathname) => pathname === '/' || pathname.startsWith('/movie/');

export default function Layout() {
  const { pathname } = useLocation();

  // A new page starts at the top. The booking overlay keeps the page beneath it, so it does not count.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative flex min-h-page flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[#070C1C]"
      >
        Skip to content
      </a>
      <Header overlay={overHero(pathname)} />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AuthModals />
      <Toast />
    </div>
  );
}
