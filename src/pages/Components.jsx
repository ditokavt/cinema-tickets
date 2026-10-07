import { useState } from 'react';
import BookingProgress from '../components/booking/BookingProgress.jsx';
import SeatLegend from '../components/booking/SeatLegend.jsx';
import ComingSoonCard from '../components/movie/ComingSoonCard.jsx';
import MovieCard from '../components/movie/MovieCard.jsx';
import RecentlyViewedCard from '../components/movie/RecentlyViewedCard.jsx';
import TicketTabs from '../components/profile/TicketTabs.jsx';
import DateSelector from '../components/sessions/DateSelector.jsx';
import SessionCard from '../components/sessions/SessionCard.jsx';
import SessionTicket from '../components/sessions/SessionTicket.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import { Clock, TicketIcon } from '../components/ui/Icons.jsx';
import Input from '../components/ui/Input.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { api } from '../api';
import { useApp } from '../context/AppContext.jsx';
import { useAsync } from '../hooks/useAsync.js';

function Block({ title, note, children }) {
  return (
    <section className="border-t border-raised py-8">
      <h2 className="t-h3">{title}</h2>
      {note && <p className="t-body-s mt-1 text-secondary">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * Component reference. Shows the pieces that are built but not on a page yet
 * (cards, film-page showtimes, day chips) next to the shared UI kit.
 */
export default function Components() {
  const { dates } = useApp();
  const [page, setPage] = useState(3);
  const [day, setDay] = useState(dates[3].iso);
  const [tab, setTab] = useState('upcoming');
  const [step, setStep] = useState('seats');
  const [checked, setChecked] = useState(true);

  // The same calls the Home page will make.
  const { data } = useAsync(() => Promise.all([api.getNowPlaying(6), api.getComingSoon(3), api.getSessions({})]), []);
  const nowPlaying = data?.[0] ?? [];
  const comingSoon = data?.[1] ?? [];
  const sessions = (data?.[2]?.groups ?? []).flatMap((g) => g.sessions);
  const ticket = <TicketIcon size={14} />;

  return (
    <div className="container-x pb-24 pt-[6px]">
      <h1 className="t-h1">Components</h1>
      <p className="t-body-m mb-8 mt-[6px] text-secondary">Reusable pieces, including the ones waiting for the Home and film pages.</p>

      <Block title="Buttons" note="primary · white · secondary · disabled · outline · tertiary · text · notify · reminder set">
        <div className="flex flex-wrap items-center gap-3">
          <Button leftIcon={ticket} rightIcon={ticket}>Button</Button>
          <Button variant="white" leftIcon={ticket} rightIcon={ticket}>Button</Button>
          <Button variant="secondary" leftIcon={ticket} rightIcon={ticket}>Button</Button>
          <Button disabled leftIcon={ticket} rightIcon={ticket}>Button</Button>
          <Button variant="secondary" disabled>Button</Button>
          <Button variant="outline" className="h-8 text-[12px] font-semibold">Clear filters</Button>
          <Button variant="tertiary" size="xs">Button</Button>
          <Button variant="text" size="xs">Button</Button>
          <Button variant="notify">Notify Me</Button>
          <Button variant="reminder-set">Reminder set</Button>
        </div>
      </Block>

      <Block title="Inputs" note="default · filled · success · error · disabled">
        <div className="grid max-w-[1000px] gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="E.G. Text" placeholder="e.g. Text" helper="e.g. Text" />
          <Input label="E.G. Text" defaultValue="e.g. Text" />
          <Input label="E.G. Text" defaultValue="e.g. Text" success />
          <Input label="E.G. Text" defaultValue="e.g. Text" error="e.g. Text" />
          <Input label="E.G. Text" defaultValue="e.g. Text" disabled />
        </div>
      </Block>

      <Block title="Badges, checkbox, tabs">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="age">12+</Badge>
          <Badge>PANORAMA</Badge>
          <Badge variant="tint" icon={<Clock size={12} aria-hidden="true" />}>134 Min</Badge>
          <Checkbox checked={checked} onChange={setChecked} hint="Tbilisi">Galleria Tbilisi</Checkbox>
          <TicketTabs value={tab} onChange={setTab} counts={{ upcoming: 2, past: 10 }} />
        </div>
      </Block>

      <Block title="Pagination">
        <Pagination page={page} lastPage={10} onChange={setPage} className="justify-start" />
      </Block>

      <Block title="Days" note="Large chips for the film page; the compact strip lives in the Sessions filters.">
        <DateSelector dates={dates} value={day} onChange={setDay} />
      </Block>

      <Block title="Showtimes" note="Sessions-list tile and the ticket-shaped tile for the film page.">
        <div className="flex flex-wrap gap-3">
          {sessions.slice(0, 3).map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 rounded-[16px] bg-card p-4">
          {sessions.slice(0, 4).map((s) => (
            <SessionTicket key={s.id} session={s} />
          ))}
        </div>
      </Block>

      <Block title="Booking progress and seat legend">
        <div className="max-w-[720px]">
          <BookingProgress step={step} onBack={() => setStep('seats')} />
          <div className="mt-3 flex gap-3">
            <Button variant="secondary" size="xs" onClick={() => setStep('seats')}>Seats</Button>
            <Button variant="secondary" size="xs" onClick={() => setStep('checkout')}>Checkout</Button>
          </div>
          <SeatLegend className="mt-6 justify-start" />
        </div>
      </Block>

      <Block title="Now playing card">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 2xl:gap-6">
          {nowPlaying.map((m) => (
            <MovieCard key={m.slug} movie={m} />
          ))}
        </div>
      </Block>

      <Block title="Coming soon card">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:gap-6">
          {comingSoon.map((m) => (
            <ComingSoonCard key={m.slug} movie={m} />
          ))}
        </div>
      </Block>

      <Block title="Recently viewed card">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-6">
          {nowPlaying.slice(0, 4).map((m) => (
            <RecentlyViewedCard key={m.slug} movie={m} />
          ))}
        </div>
      </Block>
    </div>
  );
}
