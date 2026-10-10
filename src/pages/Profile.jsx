import { useEffect } from 'react';
import { api } from '../api';
import ProfileForm from '../components/profile/ProfileForm.jsx';
import ProfileTabs from '../components/profile/ProfileTabs.jsx';
import Button from '../components/ui/Button.jsx';
import { Check } from '../components/ui/Icons.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import MyTickets, { isUpcoming } from './MyTickets.jsx';

/** /profile and /profile/tickets share the title, tabs and ticket count. */
export default function Profile({ tab = 'info' }) {
  const { user, authReady, profileComplete, openAuth, ticketsVersion, refreshTickets, handleUnauthorized } = useApp();
  const { data: orders, error } = useAsync(() => (user ? api.getTickets() : Promise.resolve(null)), [user?.id, ticketsVersion]);

  // A 401 here means the stored token expired: back to guest, with the login modal open.
  useEffect(() => {
    if (error) handleUnauthorized(error, refreshTickets);
  }, [error, handleUnauthorized, refreshTickets]);

  // My Profile and My Tickets are for signed-in visitors: a guest gets the login modal straight away.
  useEffect(() => {
    if (authReady && !user) openAuth('login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  if (!authReady) return <div className="min-h-[60vh]" aria-busy="true" />;

  if (!user) {
    return (
      <div className="container-x pb-[118px] pt-[6px]">
        <h1 className="t-h1">My Profile</h1>
        <div className="mt-[29px] rounded-[24px] bg-card px-6 py-12 text-center">
          <p className="t-label-m">Log in to see your profile and tickets</p>
          <div className="mt-[22px] flex justify-center gap-3">
            <Button onClick={() => openAuth('signup')}>Sign up</Button>
            <Button variant="white" onClick={() => openAuth('login')}>
              Log in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x pb-[72px] pt-[6px] lg:pb-[118px]">
      <h1 className="t-h1">My Profile</h1>
      <div className="mt-7">
        <ProfileTabs ticketCount={(orders ?? []).filter(isUpcoming).length} />
      </div>
      {tab === 'info' ? (
        <div className="mt-[41px] flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
          <ProfileForm />
          {/* Profile status. Sits beside the form on wide screens and above it otherwise. */}
          <div className="w-full max-w-[880px] max-xl:order-first xl:mt-[23px] xl:w-[302px]" aria-live="polite">
            {profileComplete ? (
              <p className="t-label-m flex h-9 items-center gap-2 rounded-[10px] bg-tint-green px-3 text-success">
                Profile Complete
                <Check size={18} strokeWidth={2.4} aria-hidden="true" />
              </p>
            ) : (
              <div className="rounded-[10px] bg-tint-orange px-3 pb-[10px] pt-[9px]">
                <p className="t-label-m text-warning">Profile incomplete</p>
                <p className="t-body-s mt-[3px] text-secondary">Please complete your profile to enable booking.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-[35px]">
          <MyTickets orders={orders} error={error && error.status !== 401 ? error : null} onRetry={refreshTickets} />
        </div>
      )}
    </div>
  );
}
