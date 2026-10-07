import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export const PROFILE_MESSAGE = 'Please complete your profile to enable booking.';
export const ageMessage = (code) => `This film is rated ${code}. You cannot buy tickets for it with this account.`;

/** True when the signed-in account is younger than the film's rating allows. Guests are checked after login. */
export function isTooYoung(user, movie) {
  const minAge = movie?.ageRating?.minAge ?? 0;
  return Boolean(user && typeof user.age === 'number' && minAge > 0 && user.age < minAge);
}

/**
 * The one way into the booking modal. In order:
 *   guest                -> login modal, then the same checks again
 *   profile incomplete   -> message + My Profile
 *   too young for rating -> message, nothing opens
 *   otherwise            -> /booking/:id over the current page
 */
export function useBooking() {
  const { requireAuth, toast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (session, movie = session.movie) => {
      requireAuth((account) => {
        if (!account.profileComplete) {
          toast(PROFILE_MESSAGE);
          navigate('/profile');
          return;
        }
        if (isTooYoung(account, movie)) {
          toast(ageMessage(movie.ageRating.code), 'error');
          return;
        }
        navigate(`/booking/${session.id}`, { state: { background: location } });
      });
    },
    [requireAuth, toast, navigate, location],
  );
}
