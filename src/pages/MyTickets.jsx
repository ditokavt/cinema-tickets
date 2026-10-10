import { useState } from 'react';
import { api } from '../api';
import TicketCard from '../components/profile/TicketCard.jsx';
import TicketTabs from '../components/profile/TicketTabs.jsx';
import Button from '../components/ui/Button.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useApp } from '../context/AppContext.jsx';

/** Upcoming is paid orders whose session has not started; Past is everything else, refunds included. */
export const isUpcoming = (order) => order.isUpcoming && order.status !== 'refunded' && !order.refundedAt;

/** My Tickets tab: Upcoming / Past lists of order cards. */
export default function MyTickets({ orders, error, onRetry }) {
  const { refreshTickets, handleUnauthorized, toast } = useApp();
  const [tab, setTab] = useState('upcoming');
  const [refunding, setRefunding] = useState(null);
  const [message, setMessage] = useState('');

  const upcoming = (orders ?? []).filter(isUpcoming);
  const past = (orders ?? []).filter((o) => !isUpcoming(o));
  const list = tab === 'upcoming' ? upcoming : past;

  const refund = async (order) => {
    if (refunding) return;
    setRefunding(order.id);
    setMessage('');
    try {
      await api.refundOrder(order.reference);
      toast('Refund complete. The order is now under Past.', 'success');
      refreshTickets(); // the order moves to Past; re-read rather than guess
    } catch (err) {
      if (!handleUnauthorized(err, () => refund(order))) setMessage(err.message);
    } finally {
      setRefunding(null);
    }
  };

  return (
    <div>
      <TicketTabs value={tab} onChange={setTab} counts={{ upcoming: upcoming.length, past: past.length }} />

      {message && (
        <p role="alert" className="t-body-s mt-4 text-brand">
          {message}
        </p>
      )}

      {error ? (
        <div role="alert" className="mt-5 rounded-[24px] bg-card px-6 py-12 text-center">
          <p className="t-label-m">We couldn’t load your tickets</p>
          <p className="t-body-m mt-2 text-secondary">{error.message}</p>
          <Button variant="secondary" onClick={onRetry} className="mt-[22px]">
            Try again
          </Button>
        </div>
      ) : !orders ? (
        <div className="mt-5 flex flex-col gap-5" aria-busy="true" aria-label="Loading tickets">
          <Skeleton className="h-[183px] w-full rounded-[24px]" />
          <Skeleton className="h-[183px] w-full rounded-[24px]" />
        </div>
      ) : list.length === 0 ? (
        <div className="mt-5 rounded-[24px] bg-card px-6 py-12 text-center">
          <p className="t-label-m">{tab === 'upcoming' ? 'No upcoming tickets' : 'No past tickets'}</p>
          <p className="t-body-m mt-2 text-secondary">Tickets you book will show up here.</p>
          <Button variant="secondary" to="/sessions" className="mt-[22px]">
            Browse all sessions
          </Button>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-5">
          {list.map((order) => (
            <li key={order.id}>
              <TicketCard order={order} busy={refunding === order.id} onRefund={refund} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
