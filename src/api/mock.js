/**
 * In-browser stand-in for the Kino XII API. Same function names, same return
 * shapes and the same error contract as endpoints.js (ApiError with 401 / 409 /
 * 422), and it enforces the rules the real API enforces, so either can sit
 * behind the screens.
 */
import { ApiError, tokenStore } from './client.js';
import { COMING_SOON_ORDER, inOrder, movies, NOW_PLAYING_ORDER, summary } from '../data/movies.js';
import { buildSeatMap } from '../data/seats.js';
import { sessionById, sessions } from '../data/sessions.js';
import { seededOrders } from '../data/tickets.js';
import { seededUsers } from '../data/users.js';
import { filterOptions, timeBands, venues } from '../data/venues.js';
import { today } from '../lib/format.js';

const FILMS_PER_PAGE = 4;
const wait = (value, ms = 40) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

const store = {
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(`kino.mock.${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(`kino.mock.${key}`, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
  },
};

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v ?? '');
const invalid = (errors) => new ApiError(422, 'The given data was invalid.', { errors });

function ageOn(dateOfBirth, date) {
  const [by, bm, bd] = dateOfBirth.split('-').map(Number);
  const [y, m, d] = date.split('-').map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

function withDerived(user) {
  return {
    ...user,
    age: user.dateOfBirth ? ageOn(user.dateOfBirth, today()) : null,
    profileComplete: Boolean(user.fullName?.trim() && user.mobileNumber && user.dateOfBirth),
  };
}

function currentUser() {
  const token = tokenStore.get();
  if (!token) return null;
  const user = store.read('users', {})[token.replace(/^mock\|/, '')];
  return user ? withDerived(user) : null;
}

function requireUser() {
  const user = currentUser();
  if (!user) throw new ApiError(401, 'Unauthenticated.');
  return user;
}

function saveUser(user) {
  const users = store.read('users', {});
  users[user.email] = withDerived(user);
  store.write('users', users);
  return users[user.email];
}

const fileToDataUrl = (file) =>
  new Promise((resolve) => {
    if (!file || typeof file === 'string') return resolve(file || null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

// ---- Auth -------------------------------------------------------------------
export async function register({ username, email, password, passwordConfirmation, avatar }) {
  const errors = {};
  if (!username || username.trim().length < 3) errors.username = ['Username must be at least 3 characters.'];
  if (!isEmail(email)) errors.email = ['Enter a valid email address.'];
  else if (store.read('users', {})[email] || seededUsers[email]) errors.email = ['This email is already registered.'];
  if (!password || password.length < 3) errors.password = ['Password must be at least 3 characters.'];
  if (password !== passwordConfirmation) errors.password_confirmation = ['Passwords do not match.'];
  if (Object.keys(errors).length) throw invalid(errors);

  const user = saveUser({
    id: Date.now(),
    username: username.trim(),
    email,
    avatar: await fileToDataUrl(avatar),
    fullName: null,
    mobileNumber: null,
    dateOfBirth: null,
    preferredVenue: null,
  });
  const token = `mock|${email}`;
  tokenStore.set(token);
  return wait({ user, token });
}

export async function login({ email, password }) {
  const errors = {};
  if (!isEmail(email)) errors.email = ['Enter a valid email address.'];
  if (!password) errors.password = ['Enter your password.'];
  if (Object.keys(errors).length) throw invalid(errors);
  if (password.length < 3 || password === 'wrong') throw new ApiError(401, 'Invalid credentials.');

  const users = store.read('users', {});
  const user = users[email]
    ? withDerived(users[email])
    : saveUser(
        seededUsers[email]
          ? { ...seededUsers[email] }
          : { id: Date.now(), username: email.split('@')[0], email, avatar: null, fullName: null, mobileNumber: null, dateOfBirth: null, preferredVenue: null },
      );
  const token = `mock|${email}`;
  tokenStore.set(token);
  return wait({ user, token });
}

export async function logout() {
  tokenStore.set(null);
  return wait(null);
}

export async function me() {
  return wait(requireUser());
}

// ---- Profile ----------------------------------------------------------------
export async function updateProfile({ fullName, mobileNumber, dateOfBirth, preferredVenueId, avatar }) {
  const user = requireUser();
  const errors = {};
  const mobile = String(mobileNumber ?? '').replace(/\s+/g, '');
  const name = fullName?.trim() ?? '';
  if (!name) errors.fullName = ['Name is required'];
  else if (name.length < 3) errors.fullName = ['Name must be at least 3 characters'];
  else if (name.length > 50) errors.fullName = ['Name must not exceed 50 characters'];
  if (!mobile) errors.mobileNumber = ['Mobile number is required'];
  else if (!/^\d+$/.test(mobile)) errors.mobileNumber = ['Please enter a valid Georgian mobile number (9 digits starting with 5)'];
  else if (!mobile.startsWith('5')) errors.mobileNumber = ['Georgian mobile numbers must start with 5'];
  else if (mobile.length !== 9) errors.mobileNumber = ['Mobile number must be exactly 9 digits'];
  if (!dateOfBirth) errors.dateOfBirth = ['Date of birth is required'];
  else if (dateOfBirth > today()) errors.dateOfBirth = ['Please enter a valid date of birth'];
  else if (ageOn(dateOfBirth, today()) < 12) errors.dateOfBirth = ['You must be at least 12 years old to create an account'];
  if (Object.keys(errors).length) throw invalid(errors);

  return wait(
    saveUser({
      ...user,
      fullName: fullName.trim(),
      mobileNumber: mobile,
      dateOfBirth,
      preferredVenue: venues.find((v) => v.id === Number(preferredVenueId)) ?? null,
      avatar: user.avatar, // set at registration only
    }),
  );
}

// ---- Catalogue --------------------------------------------------------------
const notified = () => store.read('reminders', []);
const listed = (m) => ({ ...summary(m), isNotified: Boolean(currentUser()) && notified().includes(m.slug) });

export async function search(q) {
  const needle = String(q ?? '').trim().toLowerCase();
  if (!needle) return wait([]);
  return wait(movies.filter((m) => m.title.toLowerCase().includes(needle)).slice(0, 6).map(listed));
}

const limited = (list, limit) => (limit ? list.slice(0, Number(limit)) : list);
export const getNowPlaying = (limit) => wait(limited(inOrder(movies.filter((m) => !m.isComingSoon), NOW_PLAYING_ORDER), limit).map(listed));
export const getComingSoon = (limit) => wait(limited(inOrder(movies.filter((m) => m.isComingSoon), COMING_SOON_ORDER), limit).map(listed));
export const getFeatured = () => wait(movies.filter((m) => m.isFeatured).map(listed));

export async function getMovie(slug) {
  const movie = movies.find((m) => m.slug === slug);
  if (!movie) throw new ApiError(404, 'Not found.');
  const availableDates = [...new Set(sessions.filter((s) => s.movie.slug === slug).map((s) => s.date))].sort();
  return wait({ ...movie, isNotified: Boolean(currentUser()) && notified().includes(slug), availableDates });
}

export async function getMovieSessions(slug, date = today()) {
  if (!movies.some((m) => m.slug === slug)) throw new ApiError(404, 'Not found.');
  const groups = [];
  sessions
    .filter((s) => s.movie.slug === slug && s.date === date)
    .sort((a, b) => a.time.localeCompare(b.time))
    .forEach((s) => {
      let group = groups.find((g) => g.venue.id === s.venue.id);
      if (!group) groups.push((group = { venue: s.venue, sessions: [] }));
      group.sessions.push(s);
    });
  return wait(groups);
}

export async function notify(slug) {
  requireUser();
  const movie = movies.find((m) => m.slug === slug);
  if (!movie) throw new ApiError(404, 'Not found.');
  store.write('reminders', [...new Set([...notified(), slug])]);
  return wait({ movieId: movie.id, subscribed: true });
}

// ---- Sessions ---------------------------------------------------------------
export const getFilterOptions = () => wait(filterOptions);

export async function getSessions(filters = {}) {
  const { date, venues: venueSlugs = [], formats = [], languages = [], bands = [], search: title = '', sort = 'time_asc', page = 1 } = filters;
  const day = date || today();
  const needle = title.trim().toLowerCase();
  const chosenBands = timeBands.filter((b) => bands.includes(b.id));

  const list = sessions.filter(
    (s) =>
      s.date === day &&
      (!needle || s.movie.title.toLowerCase().includes(needle)) &&
      (!venueSlugs.length || venueSlugs.includes(s.venue.slug)) &&
      (!formats.length || formats.includes(s.format.slug)) &&
      (!languages.length || languages.includes(s.language.slug)) &&
      (!chosenBands.length || chosenBands.some((b) => s.time >= b.from && s.time < b.to)),
  );

  const byTime = (a, b) => a.time.localeCompare(b.time);
  const groups = [];
  list.forEach((s) => {
    let group = groups.find((g) => g.movie.id === s.movie.id);
    if (!group) groups.push((group = { movie: s.movie, sessions: [] }));
    group.sessions.push(s);
  });
  groups.forEach((g) => g.sessions.sort(byTime));

  const cheapest = (g) => Math.min(...g.sessions.map((s) => s.price));
  const dearest = (g) => Math.max(...g.sessions.map((s) => s.price));
  const order = {
    time_asc: null,
    time_desc: (a, b) => b.sessions.at(-1).time.localeCompare(a.sessions.at(-1).time),
    price_asc: (a, b) => cheapest(a) - cheapest(b),
    price_desc: (a, b) => dearest(b) - dearest(a),
    title_asc: (a, b) => a.movie.title.localeCompare(b.movie.title),
  }[sort];
  if (order) groups.sort(order);
  if (sort === 'time_desc') groups.forEach((g) => g.sessions.reverse());
  if (sort === 'price_asc') groups.forEach((g) => g.sessions.sort((a, b) => a.price - b.price || byTime(a, b)));
  if (sort === 'price_desc') groups.forEach((g) => g.sessions.sort((a, b) => b.price - a.price || byTime(a, b)));

  const lastPage = Math.max(1, Math.ceil(groups.length / FILMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), lastPage);
  return wait({
    groups: groups.slice((currentPage - 1) * FILMS_PER_PAGE, currentPage * FILMS_PER_PAGE),
    meta: { currentPage, lastPage, perPage: FILMS_PER_PAGE, totalSessions: list.length, totalMovies: groups.length, date: day },
  });
}

export async function getSession(id) {
  const session = sessionById[String(id)];
  if (!session) throw new ApiError(404, 'Not found.');
  return wait(session);
}

const liveHold = (sessionId) => {
  const hold = store.read('holds', {})[String(sessionId)];
  return hold && new Date(hold.expiresAt).getTime() > Date.now() ? hold : null;
};

function seatMapFor(session) {
  const sold = store.read('sold', {})[String(session.id)] ?? [];
  const mine = currentUser() ? (liveHold(session.id)?.seats.map((s) => s.code) ?? []) : [];
  return buildSeatMap(session, sold, mine);
}

export async function getSeatMap(id) {
  const session = sessionById[String(id)];
  if (!session) throw new ApiError(404, 'Not found.');
  return wait(seatMapFor(session));
}

// ---- Booking ----------------------------------------------------------------
export async function createHold(sessionId, seats) {
  const user = requireUser();
  const session = sessionById[String(sessionId)];
  if (!session) throw new ApiError(404, 'Not found.');

  if (!seats?.length) throw invalid({ seats: ['Select at least one seat.'] });
  if (seats.length > filterOptions.maxSeatsPerOrder) throw invalid({ seats: [`You can hold at most ${filterOptions.maxSeatsPerOrder} seats per order.`] });
  if (!user.profileComplete) throw new ApiError(422, 'Please complete your profile before booking.');
  const minAge = session.movie.ageRating.minAge;
  if (minAge > 0 && user.age < minAge) throw new ApiError(422, `This title is rated ${session.movie.ageRating.code}. You must be ${minAge} or over to book.`);

  const all = seatMapFor(session).sections.flatMap((section) => section.rows.flatMap((r) => r.seats));
  const picked = seats.map((s) => ({ ...s, seat: all.find((x) => x.id === s.seatId), type: filterOptions.ticketTypes.find((t) => t.slug === s.ticketType) }));
  if (picked.some((p) => !p.seat || !p.type)) throw invalid({ seats: ['One of those seats is not in this hall.'] });
  if (picked.some((p) => p.type.blockedFromRatingAge !== null && minAge >= p.type.blockedFromRatingAge)) {
    throw invalid({ seats: [`Child tickets are not available for ${session.movie.ageRating.code} titles.`] });
  }
  const contested = picked.filter((p) => p.seat.state !== 'available' && !p.seat.isMine).map((p) => p.seat.code);
  if (contested.length) throw new ApiError(409, 'Some of those seats were just taken.', { contested });

  const held = picked.map((p) => ({
    seatId: p.seat.id,
    code: p.seat.code,
    ticketType: { slug: p.type.slug, name: p.type.name },
    price: Math.round(session.price * p.type.priceRatio * 100) / 100,
  }));
  const hold = {
    holdId: `mock-${Date.now()}`,
    sessionId: session.id,
    expiresAt: new Date(Date.now() + filterOptions.holdMinutes * 60000).toISOString(),
    secondsRemaining: filterOptions.holdMinutes * 60,
    isLive: true,
    subtotal: Math.round(held.reduce((sum, s) => sum + s.price, 0) * 100) / 100,
    seats: held,
  };
  const holds = store.read('holds', {});
  holds[String(session.id)] = hold; // one hold per session: holding again replaces it
  store.write('holds', holds);
  return wait(hold);
}

const findHold = (holdId) => Object.values(store.read('holds', {})).find((h) => h.holdId === holdId);

export async function getHold(holdId) {
  requireUser();
  const hold = findHold(holdId);
  if (!hold) throw new ApiError(404, 'Not found.');
  const secondsRemaining = Math.max(0, Math.round((new Date(hold.expiresAt).getTime() - Date.now()) / 1000));
  return wait({ ...hold, secondsRemaining, isLive: secondsRemaining > 0 });
}

export async function releaseHold(holdId) {
  const holds = store.read('holds', {});
  Object.keys(holds).forEach((key) => holds[key].holdId === holdId && delete holds[key]);
  store.write('holds', holds);
  return wait(null);
}

export async function createOrder({ holdId, fullName, email, mobileNumber, cardNumber, expiry, cvv }) {
  requireUser();
  const digits = (v) => String(v ?? '').replace(/\D/g, '');
  const errors = {};
  if ((fullName?.trim().length ?? 0) < 3) errors.fullName = ['Name must be at least 3 characters'];
  if (!isEmail(email)) errors.email = ['Enter a valid email address.'];
  if (!/^5\d{8}$/.test(digits(mobileNumber))) errors.mobileNumber = ['Georgian mobile numbers must start with 5'];
  if (digits(cardNumber).length !== 16) errors.cardNumber = ['Card number must be 16 digits'];
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry ?? '')) errors.expiry = ['Expiry must be MM/YY'];
  if (!/^\d{3}$/.test(cvv ?? '')) errors.cvv = ['CVV must be 3 digits'];
  if (Object.keys(errors).length) throw invalid(errors);

  const hold = findHold(holdId);
  if (!hold || new Date(hold.expiresAt).getTime() < Date.now()) {
    throw new ApiError(422, 'Your hold time expired. Please re-select your seats.');
  }

  const session = sessionById[String(hold.sessionId)];
  const orders = store.read('orders', []);
  const id = 48293 + orders.length;
  const order = {
    id,
    reference: `KX-${id}`,
    status: 'paid',
    totalPrice: hold.subtotal,
    paidAt: new Date().toISOString(),
    refundedAt: null,
    isUpcoming: true,
    isRefundable: true,
    cardLastFour: digits(cardNumber).slice(-4),
    contact: { fullName: fullName.trim(), email, mobileNumber: digits(mobileNumber) },
    session,
    tickets: hold.seats.map((s, i) => ({ id: id * 10 + i, seatCode: s.code, ticketType: s.ticketType, price: s.price })),
  };
  store.write('orders', [order, ...orders]);

  const sold = store.read('sold', {});
  sold[String(session.id)] = [...(sold[String(session.id)] ?? []), ...hold.seats.map((s) => s.code)];
  store.write('sold', sold);
  await releaseHold(holdId);
  return wait(order, 500);
}

// ---- Tickets ----------------------------------------------------------------
function allOrders() {
  const refunded = store.read('refunded', {});
  return [...store.read('orders', []), ...seededOrders()].map((o) =>
    refunded[o.reference] ? { ...o, status: 'refunded', refundedAt: refunded[o.reference], isRefundable: false } : o,
  );
}

const isUpcomingOrder = (o) => o.isUpcoming && o.status === 'paid';

export async function getTickets(filter) {
  requireUser();
  const orders = allOrders();
  if (filter === 'upcoming') return wait(orders.filter(isUpcomingOrder));
  if (filter === 'past') return wait(orders.filter((o) => !isUpcomingOrder(o)));
  return wait(orders);
}

export async function refundOrder(reference) {
  requireUser();
  const order = allOrders().find((o) => o.reference === reference);
  if (!order) throw new ApiError(404, 'Not found.');
  if (order.status === 'refunded') throw new ApiError(422, 'This order has already been refunded.');
  if (!order.isRefundable) throw new ApiError(422, 'Refunds close 2 hours before the session starts.');
  const refundedAt = new Date().toISOString();
  store.write('refunded', { ...store.read('refunded', {}), [reference]: refundedAt });
  return wait({ ...order, status: 'refunded', refundedAt, isRefundable: false });
}
