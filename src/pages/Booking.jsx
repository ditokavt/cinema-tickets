import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BookingModal from '../components/booking/BookingModal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { PROFILE_MESSAGE } from '../hooks/useBooking.js';
import Sessions from './Sessions.jsx';

/**
 * /booking/:sessionId — the booking panel is an overlay.
 * Opened from a showtime it floats over the page the visitor was on
 * (`overlay`); opened from a pasted link it sits over the Sessions page.
 *
 * The panel only opens for a signed-in account with a complete profile.
 * Showtime buttons check that before navigating (useBooking); this guard
 * covers the address being opened directly.
 */
export default function Booking({ overlay = false }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authReady, authModal, profileComplete, openAuth, toast } = useApp();
  const [asked, setAsked] = useState(false);

  const fromPage = overlay && location.state?.background;
  const close = () => (fromPage ? navigate(-1) : navigate('/sessions'));

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setAsked(true);
      openAuth('login');
    } else if (!profileComplete) {
      toast(PROFILE_MESSAGE);
      navigate('/profile', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user, profileComplete]);

  // The login modal was dismissed without signing in: there is nothing to show here.
  useEffect(() => {
    if (asked && !authModal && !user) navigate(fromPage ? -1 : '/sessions', { replace: !fromPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asked, authModal, user]);

  const allowed = authReady && user && profileComplete;
  const modal = allowed ? <BookingModal key={sessionId} sessionId={sessionId} onClose={close} onHome={() => navigate('/')} /> : null;
  if (overlay) return modal;
  return (
    <>
      <Sessions />
      {modal}
    </>
  );
}
