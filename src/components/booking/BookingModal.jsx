import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../api';
import { useApp } from '../../context/AppContext.jsx';
import { ageMessage, isTooYoung } from '../../hooks/useBooking.js';
import { hallLabel, longDate } from '../../lib/format.js';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import Price from '../ui/Price.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import BookingConfirmation from './BookingConfirmation.jsx';
import BookingProgress from './BookingProgress.jsx';
import BookingSummary from './BookingSummary.jsx';
import CheckoutForm, { CHECKOUT_FIELDS, formatMobile, isCheckoutValid } from './CheckoutForm.jsx';
import OrderSummary from './OrderSummary.jsx';
import SeatMap from './SeatMap.jsx';

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
const firstError = (err) => Object.values(err.errors ?? {}).flat()[0];
const allTouched = Object.fromEntries(CHECKOUT_FIELDS.map((name) => [name, true]));

const holdKey = (sessionId) => `kino.hold.${sessionId}`;
const rememberHold = (sessionId, holdId) => {
  try {
    if (holdId) sessionStorage.setItem(holdKey(sessionId), holdId);
    else sessionStorage.removeItem(holdKey(sessionId));
  } catch {
    /* storage unavailable */
  }
};
const recallHold = (sessionId) => {
  try {
    return sessionStorage.getItem(holdKey(sessionId));
  } catch {
    return null;
  }
};

function Notice({ children }) {
  return (
    <p role="alert" className="t-body-s mb-4 rounded-[10px] bg-tint-orange px-3 py-[10px] text-warning">
      {children}
    </p>
  );
}

/**
 * Booking overlay: seats -> checkout -> confirmation, as three API calls.
 *   GET  /sessions/{id}/seats   draw the hall
 *   POST /sessions/{id}/holds   reserve the seats for the hold window (step 1 -> 2)
 *   POST /orders                pay; the confirmation is rendered from the response
 *
 * Error contract: 401 opens the login modal and replays the action; 409 marks
 * the contested seats sold, keeps the rest and refetches the map; a
 * message-only 422 is a booking rule and is shown as written; a 422 with
 * `errors` maps onto the form.
 */
export default function BookingModal({ sessionId, onClose, onHome }) {
  const { filterOptions, user, profileComplete, openAuth, handleUnauthorized, refreshTickets } = useApp();
  const [attempt, setAttempt] = useState(0);
  const [session, setSession] = useState(null);
  const [map, setMap] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState('seats');
  const [seats, setSeats] = useState([]); // [{ seatId, code, type }]
  const [hold, setHold] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', mobileNumber: '', cardNumber: '', expiry: '', cvv: '' });
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [now, setNow] = useState(() => Date.now());
  const holdRef = useRef(null);
  holdRef.current = step === 'done' ? null : hold;

  const loadMap = useCallback(() => api.getSeatMap(sessionId).then(setMap), [sessionId]);

  // The map is public, so it is drawn before anyone signs in.
  useEffect(() => {
    let alive = true;
    setLoadError('');
    Promise.all([api.getSession(sessionId), api.getSeatMap(sessionId)])
      .then(([s, m]) => {
        if (!alive) return;
        setSession(s);
        setMap(m);
      })
      .catch((err) => alive && setLoadError(err.message || 'We couldn’t load this session.'));
    return () => {
      alive = false;
    };
  }, [sessionId, attempt]);

  // A reload mid-booking picks the live hold back up instead of losing the seats.
  useEffect(() => {
    const stored = recallHold(sessionId);
    if (!user || !stored) return undefined;
    let alive = true;
    api
      .getHold(stored)
      .then((found) => {
        if (!alive) return;
        if (!found.isLive) return rememberHold(sessionId, null);
        setHold(found);
        setSeats(found.seats.map((s) => ({ seatId: s.seatId, code: s.code, type: s.ticketType.slug })));
        loadMap().catch(() => {});
      })
      .catch(() => rememberHold(sessionId, null));
    return () => {
      alive = false;
    };
  }, [sessionId, user, loadMap]);

  // Prefill the contact fields from the profile.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      fullName: f.fullName || user.fullName || '',
      email: f.email || user.email || '',
      mobileNumber: f.mobileNumber || formatMobile(user.mobileNumber ?? ''),
    }));
  }, [user]);

  // Countdown runs from the hold's expiresAt, so a slow render or a background tab cannot drift it.
  useEffect(() => {
    if (!hold || step === 'done') return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [hold, step]);

  const holdSeconds = (filterOptions?.holdMinutes ?? 8) * 60;
  const secondsLeft = hold ? Math.max(0, Math.ceil((new Date(hold.expiresAt).getTime() - now) / 1000)) : holdSeconds;

  const resetAfterExpiry = useCallback(
    (message) => {
      rememberHold(sessionId, null);
      setHold(null);
      setSeats([]);
      setStep('seats');
      setServerErrors({});
      setNotice(message);
      loadMap().catch(() => {});
    },
    [sessionId, loadMap],
  );

  useEffect(() => {
    if (hold && step !== 'done' && secondsLeft === 0) resetAfterExpiry('Your hold time expired. Please re-select your seats.');
  }, [hold, step, secondsLeft, resetAfterExpiry]);

  // Ticket types this title allows, cheapest first as in the design.
  const minAge = session?.movie.ageRating?.minAge ?? 0;
  const ticketTypes = useMemo(
    () =>
      [...(filterOptions?.ticketTypes ?? [])]
        .filter((t) => t.blockedFromRatingAge === null || t.blockedFromRatingAge === undefined || minAge < t.blockedFromRatingAge)
        .sort((a, b) => a.priceRatio - b.priceRatio),
    [filterOptions, minAge],
  );
  const maxSeats = filterOptions?.maxSeatsPerOrder ?? 3;
  const defaultType = ticketTypes.find((t) => t.slug === 'adult')?.slug ?? ticketTypes[ticketTypes.length - 1]?.slug;
  const tooYoung = isTooYoung(user, session?.movie);

  const subtotal = useMemo(
    () => seats.reduce((sum, seat) => sum + (session?.price ?? 0) * (ticketTypes.find((t) => t.slug === seat.type)?.priceRatio ?? 1), 0),
    [seats, session, ticketTypes],
  );

  const toggleSeat = (seat) => {
    setNotice(null);
    setSeats((list) => {
      if (list.some((s) => s.seatId === seat.id)) return list.filter((s) => s.seatId !== seat.id);
      if (list.length >= maxSeats) {
        setNotice(`You can select up to ${maxSeats} seats per order.`);
        return list;
      }
      return [...list, { seatId: seat.id, code: seat.code, type: defaultType }];
    });
  };

  const handleError = (err, replay) => {
    if (handleUnauthorized(err, replay)) return;
    if (err.status === 409) {
      const contested = err.contested ?? [];
      setSeats((list) => list.filter((s) => !contested.includes(s.code)));
      rememberHold(sessionId, null);
      setHold(null);
      setStep('seats');
      setNotice(
        contested.length
          ? `${contested.length > 1 ? 'Seats' : 'Seat'} ${contested.join(', ')} ${contested.length > 1 ? 'were' : 'was'} just taken. The rest of your selection is still here.`
          : err.message,
      );
      loadMap().catch(() => {});
    } else if (err.isValidation) {
      setNotice(firstError(err) ?? err.message);
    } else {
      setNotice(err.message);
    }
  };

  const holdSeats = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const created = await api.createHold(
        sessionId,
        seats.map((s) => ({ seatId: s.seatId, ticketType: s.type })),
      );
      setHold(created);
      rememberHold(sessionId, created.holdId);
      setStep('checkout');
    } catch (err) {
      handleError(err, holdSeats);
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (!user) return openAuth('login', holdSeats);
    if (!profileComplete) return setNotice('Please complete your profile to enable booking.');
    return holdSeats();
  };

  const pay = async () => {
    setTouched(allTouched);
    if (!isCheckoutValid(form) || busy || !hold) return;
    setBusy(true);
    setNotice(null);
    setServerErrors({});
    try {
      const created = await api.createOrder({
        holdId: hold.holdId,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobileNumber: form.mobileNumber.replace(/\D/g, ''),
        cardNumber: form.cardNumber,
        expiry: form.expiry,
        cvv: form.cvv,
      });
      rememberHold(sessionId, null);
      setOrder(created);
      setStep('done');
      refreshTickets();
    } catch (err) {
      if (err.isValidation) {
        const fields = {};
        Object.entries(err.errors).forEach(([key, messages]) => {
          fields[key] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setServerErrors(fields);
      } else if (err.isRule) {
        resetAfterExpiry(err.message); // the hold ran out between holding and paying
      } else {
        handleError(err, pay);
      }
    } finally {
      setBusy(false);
    }
  };

  /** Closing without paying hands the seats straight back instead of leaving them held for 8 minutes. */
  const close = () => {
    if (holdRef.current) {
      api.releaseHold(holdRef.current.holdId).catch(() => {});
      rememberHold(sessionId, null);
    }
    onClose();
  };

  const noticeNode = (notice || tooYoung) && <Notice>{notice ?? ageMessage(session.movie.ageRating.code)}</Notice>;
  const done = step === 'done' && order;

  return (
    <Modal open onClose={close} labelledBy="booking-title" bordered={false} className="max-w-[1146px]">
      {done ? (
        <BookingConfirmation order={order} onHome={onHome ?? onClose} />
      ) : (
        <div className="p-5 sm:p-8">
          {loadError ? (
            <div role="alert" className="flex min-h-[240px] flex-col items-center justify-center gap-5 text-center">
              <p id="booking-title" className="t-label-m">
                {loadError}
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setAttempt((n) => n + 1)}>Try again</Button>
                <Button variant="secondary" onClick={close}>
                  Close
                </Button>
              </div>
            </div>
          ) : !session || !map ? (
            <div id="booking-title" className="lg:min-h-[535px]" aria-busy="true" aria-label="Loading seats">
              <Skeleton className="h-[22px] w-[180px]" />
              <Skeleton className="mt-3 h-[14px] w-[min(450px,90%)]" />
              <Skeleton className="mt-8 h-[33px] w-full max-w-[720px] rounded-full" />
              <Skeleton className="mt-5 h-[320px] w-full max-w-[720px] rounded-[16px]" />
            </div>
          ) : (
            <>
              <div className="flex min-h-[46px] items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 id="booking-title" className="t-h2 uppercase">
                    {session.movie.title}
                  </h2>
                  <p className="t-body-s mt-2 text-secondary">
                    {session.venue.name} · {hallLabel(session.hall)} · {longDate(session.date)} · {session.time} · {session.format.name} ·{' '}
                    {session.language.name}
                  </p>
                </div>
                {/* The countdown belongs to the hold, so it appears once the seats are held (step 2). */}
                {hold && (
                  <div className="flex h-[46px] w-[102px] shrink-0 flex-col items-center justify-center gap-px rounded-[12px] bg-card" role="timer" aria-label="Seats held for">
                    <span className="t-label-s uppercase text-secondary">Seats held</span>
                    <span className="t-button tabular-nums">{clock(secondsLeft)}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 grid gap-x-5 gap-y-8 lg:grid-cols-[minmax(0,1fr)_1px_321px]">
                <div className="min-w-0">
                  <BookingProgress step={step} onBack={() => setStep('seats')} />
                  {step === 'seats' ? (
                    <div className="mt-[19.5px]">
                      <SeatMap map={map} selectedIds={seats.map((s) => s.seatId)} onToggle={toggleSeat} />
                    </div>
                  ) : (
                    <form
                      noValidate
                      className="mt-6"
                      onSubmit={(e) => {
                        e.preventDefault();
                        pay();
                      }}
                    >
                      <CheckoutForm
                        values={form}
                        touched={touched}
                        serverErrors={serverErrors}
                        disabled={busy}
                        onChange={(name, value) => {
                          setForm((f) => ({ ...f, [name]: value }));
                          setServerErrors((e) => ({ ...e, [name]: '' }));
                        }}
                        onBlur={(name) => setTouched((t) => ({ ...t, [name]: true }))}
                      />
                      <button type="submit" hidden />
                    </form>
                  )}
                </div>

                <div aria-hidden="true" className="hidden bg-card lg:block" />

                <div className="min-w-0 lg:min-h-[457px]">
                  {step === 'seats' ? (
                    <BookingSummary
                      seats={seats}
                      basePrice={session.price}
                      ticketTypes={ticketTypes}
                      maxSeats={maxSeats}
                      subtotal={subtotal}
                      notice={noticeNode}
                      busy={busy}
                      blocked={tooYoung}
                      onTypeChange={(seatId, type) => setSeats((list) => list.map((s) => (s.seatId === seatId ? { ...s, type } : s)))}
                      onRemove={(seatId) => setSeats((list) => list.filter((s) => s.seatId !== seatId))}
                      onNext={next}
                    />
                  ) : (
                    <div className="flex h-full flex-col">
                      <h3 className="t-button">Summary</h3>
                      <div className="mt-3">
                        <OrderSummary session={session} hold={hold} />
                      </div>
                      <div className="mt-auto pt-6">
                        {noticeNode}
                        <div className="flex items-center justify-between px-[5px]">
                          <span className="t-label-s uppercase text-white">Subtotal</span>
                          <Price value={hold.subtotal} spaced className="t-h1" />
                        </div>
                        <Button fullWidth disabled={!isCheckoutValid(form) || busy} aria-busy={busy} onClick={pay} className="mt-3">
                          {busy ? 'Processing payment…' : 'Pay: Complete order'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
