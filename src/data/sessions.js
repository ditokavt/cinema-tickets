import { nextDays } from '../lib/format.js';
import { movies, summary } from './movies.js';
import { formats, languages, timeBands, venues } from './venues.js';

const bySlug = (list) => Object.fromEntries(list.map((x) => [x.slug, x]));
const VENUE = bySlug(venues);
const FORMAT = bySlug(formats);
const LANGUAGE = bySlug(languages);
const venueRef = ({ id, slug, name, city }) => ({ id, slug, name, city });

/**
 * Today reproduces Sessions.pdf tile for tile: [time, format, seatsLeft].
 * seatsLeft 0 is the sold-out state.
 */
const DESIGNED_DAY = {
  'the-odyssey': [
    ['10:15', 'standard', 21],
    ['14:00', 'max', 1],
    ['16:30', 'panorama', 45],
    ['19:15', 'panorama', 25],
    ['21:15', 'panorama', 4],
  ],
  'avengers-doomsday': [
    ['10:15', 'panorama', 3],
    ['14:00', 'max', 31],
    ['16:30', 'standard', 0],
    ['19:15', 'standard', 17],
    ['22:30', 'panorama', 0],
  ],
  'spider-man': [
    ['10:15', 'standard', 33],
    ['14:00', 'max', 0],
    ['16:30', 'max', 45],
    ['19:15', 'standard', 25],
  ],
  'dune-part-three': [
    ['10:15', 'panorama', 12],
    ['14:00', 'max', 5],
    ['16:30', 'standard', 30],
    ['19:15', 'standard', 15],
    ['21:15', 'standard', 0],
  ],
};

const TIMES = ['10:15', '12:00', '14:00', '16:30', '19:15', '21:15', '22:30'];
const HALLS = ['A', 'B', 'C', 'D'];

/** Small deterministic PRNG so the mock is identical on every load. */
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

let nextId = 900;

function makeSession(movie, date, time, formatSlug, languageSlug, venueSlug, hallName, price, seatsLeft) {
  const venue = venueRef(VENUE[venueSlug]);
  return {
    id: nextId++,
    startsAt: `${date}T${time}:00+00:00`,
    date,
    time,
    timeBand: timeBands.find((b) => time >= b.from && time < b.to).id,
    price,
    seatsLeft,
    isSoldOut: seatsLeft === 0,
    hall: { id: HALLS.indexOf(hallName) + 1, name: hallName, venue },
    venue,
    format: FORMAT[formatSlug],
    language: LANGUAGE[languageSlug],
    movie: summary(movie),
  };
}

function build() {
  const out = [];
  const nowPlaying = movies.filter((m) => !m.isComingSoon);

  nowPlaying.forEach((movie, mi) => {
    nextDays(7).forEach((day, di) => {
      const designed = di === 0 ? DESIGNED_DAY[movie.slug] : null;
      if (designed) {
        designed.forEach(([time, formatSlug, seatsLeft]) => {
          out.push(makeSession(movie, day.iso, time, formatSlug, 'original-subtitles', 'galleria', 'D', 22, seatsLeft));
        });
        return;
      }

      const rnd = seeded((mi + 1) * 7919 + (di + 1) * 104729);
      const count = 3 + Math.floor(rnd() * 3);
      const start = Math.floor(rnd() * 2);
      TIMES.filter((_, i) => i >= start)
        .filter(() => rnd() > 0.18)
        .slice(0, count)
        .forEach((time) => {
          const venue = venues[Math.floor(rnd() * venues.length)];
          const format = venue.formats[Math.floor(rnd() * venue.formats.length)];
          const language = languages[Math.floor(rnd() * languages.length)];
          const hall = HALLS[Math.floor(rnd() * HALLS.length)];
          const roll = rnd();
          const seatsLeft = roll < 0.14 ? 0 : roll < 0.3 ? 1 + Math.floor(rnd() * 5) : 6 + Math.floor(rnd() * 42);
          out.push(makeSession(movie, day.iso, time, format.slug, language.slug, venue.slug, hall, movie.fromPrice + format.priceUplift, seatsLeft));
        });
    });
  });
  return out;
}

export const sessions = build();
export const sessionById = Object.fromEntries(sessions.map((s) => [String(s.id), s]));
