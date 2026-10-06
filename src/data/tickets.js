import { addDays, today } from '../lib/format.js';
import { movieBySlug, summary } from './movies.js';
import { formats, languages, venues } from './venues.js';

const galleria = venues[0];
const max = formats.find((x) => x.slug === 'max');
const original = languages.find((x) => x.slug === 'original-subtitles');
const TYPE = { adult: { slug: 'adult', name: 'Adult' }, student: { slug: 'student', name: 'Student' } };
const ticket = (id, seatCode, type, price) => ({ id, seatCode, ticketType: TYPE[type], price });

/** An order shaped like the API's Order. `title` keeps the casing drawn in My Profile.pdf. */
function order(id, slug, title, date, tickets, isUpcoming) {
  const venue = { id: galleria.id, slug: galleria.slug, name: galleria.name, city: galleria.city };
  return {
    id,
    reference: `KX-${id}`,
    status: 'paid',
    totalPrice: 32,
    paidAt: `${addDays(date, -2)}T12:00:00.000Z`,
    refundedAt: null,
    isUpcoming,
    isRefundable: isUpcoming,
    cardLastFour: '4242',
    contact: { fullName: 'Meri Sanikidze', email: 'merisanikidze@gmail.com', mobileNumber: '555123456' },
    session: {
      id: 100000 + id,
      startsAt: `${date}T16:30:00+00:00`,
      date,
      time: '16:30',
      timeBand: 'afternoon',
      price: 16,
      seatsLeft: 42,
      isSoldOut: false,
      hall: { id: 2, name: 'B' },
      venue,
      format: max,
      language: original,
      movie: { ...summary(movieBySlug[slug]), title },
    },
    tickets,
  };
}

const odysseySeats = (id) => [ticket(id * 10 + 1, 'B3', 'adult', 12), ticket(id * 10 + 2, 'B4', 'adult', 12), ticket(id * 10 + 3, 'B5', 'student', 8)];
const duneSeats = (id) => [ticket(id * 10 + 1, 'B3', 'adult', 16), ticket(id * 10 + 2, 'B4', 'adult', 16)];

/** The two upcoming orders drawn in My Profile.pdf, then ten past ones alternating the same two cards. */
export function seededOrders() {
  const soon = addDays(today(), 1);
  const upcoming = [
    order(48291, 'the-odyssey', 'THE ODYSSEY', soon, odysseySeats(48291), true),
    order(48292, 'dune-part-three', 'DUNE: Part Three', soon, duneSeats(48292), true),
  ];
  const past = Array.from({ length: 10 }, (_, i) => {
    const id = 48190 - i;
    const date = addDays(today(), -7 * (i + 1));
    return i % 2 === 0
      ? order(id, 'the-odyssey', 'THE ODYSSEY', date, odysseySeats(id), false)
      : order(id, 'dune-part-three', 'DUNE: Part Three', date, duneSeats(id), false);
  });
  return [...upcoming, ...past];
}
