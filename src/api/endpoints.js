/**
 * Real API bindings — one function per endpoint of the Kino XII contract.
 * Each returns the unwrapped `data` (plus `meta` where the endpoint has one),
 * which is exactly what src/api/mock.js returns, so screens never know which
 * of the two they are talking to.
 */
import { request, tokenStore } from './client.js';

const data = (payload) => payload?.data ?? payload;

function toForm(fields) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    form.append(key, value);
  });
  return form;
}

// ---- Auth -------------------------------------------------------------------
/** multipart because of the optional avatar; password_confirmation is the one snake_case field. */
export async function register({ username, email, password, passwordConfirmation, avatar }) {
  const session = data(
    await request('/register', {
      method: 'POST',
      formData: toForm({ username, email, password, password_confirmation: passwordConfirmation, avatar }),
    }),
  );
  tokenStore.set(session.token);
  return session; // { user, token }
}

export async function login({ email, password }) {
  const session = data(await request('/login', { method: 'POST', body: { email, password } }));
  tokenStore.set(session.token);
  return session; // { user, token }
}

/** Clear the stored token whatever the response. */
export async function logout() {
  try {
    await request('/logout', { method: 'POST' });
  } finally {
    tokenStore.set(null);
  }
}

export const me = async () => data(await request('/me'));

// ---- Profile ----------------------------------------------------------------
/** The avatar is chosen at registration and cannot be changed afterwards, so it is never sent here. */
export const updateProfile = async ({ fullName, mobileNumber, dateOfBirth, preferredVenueId }) =>
  data(await request('/profile', { method: 'PUT', formData: toForm({ fullName, mobileNumber, dateOfBirth, preferredVenueId }) }));

// ---- Catalogue --------------------------------------------------------------
export const search = async (q) => data(await request('/search', { query: { q } }));
export const getNowPlaying = async (limit) => data(await request('/movies/now-playing', { query: { limit } }));
export const getComingSoon = async (limit) => data(await request('/movies/coming-soon', { query: { limit } }));
export const getFeatured = async () => data(await request('/movies/featured'));
export const getMovie = async (movie) => data(await request(`/movies/${movie}`));
export const getMovieSessions = async (movie, date) => data(await request(`/movies/${movie}/sessions`, { query: { date } }));
export const notify = async (movie) => data(await request(`/movies/${movie}/notify`, { method: 'POST' }));

// ---- Sessions ---------------------------------------------------------------
export const getFilterOptions = async () => data(await request('/filter-options'));

/** filters: { date, venues[], formats[], languages[], bands[], search, sort, page } -> { groups, meta } */
export async function getSessions({ date, venues, formats, languages, bands, search: title, sort, page } = {}) {
  const payload = await request('/sessions', { query: { date, venues, formats, languages, bands, search: title, sort, page } });
  return { groups: payload.data, meta: payload.meta };
}

export const getSession = async (session) => data(await request(`/sessions/${session}`));
export const getSeatMap = async (session) => data(await request(`/sessions/${session}/seats`));

// ---- Booking ----------------------------------------------------------------
/** seats: [{ seatId, ticketType }] — seat ids from the map, never the codes. */
export const createHold = async (session, seats) => data(await request(`/sessions/${session}/holds`, { method: 'POST', body: { seats } }));
export const getHold = async (hold) => data(await request(`/holds/${hold}`));
export const releaseHold = (hold) => request(`/holds/${hold}`, { method: 'DELETE' });

/** order: { holdId, fullName, email, mobileNumber, cardNumber, expiry, cvv } */
export const createOrder = async (order) => data(await request('/orders', { method: 'POST', body: order }));

// ---- Tickets ----------------------------------------------------------------
/** `order` is the reference, e.g. KX-7QF2LD. Returns the updated order. */
export const refundOrder = async (order) => data(await request(`/orders/${order}/refund`, { method: 'POST' }));
export const getTickets = async (filter) => data(await request('/tickets', { query: { filter } }));
