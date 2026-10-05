const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n) => String(n).padStart(2, '0');

/** Today as "YYYY-MM-DD" in the visitor's own timezone. */
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse "YYYY-MM-DD" without timezone drift. */
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(iso, n) {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** { weekday: 'Tue', weekdayLong: 'Tuesday', day: 15, month: 'Sep', monthLong: 'September' } */
export function dateParts(iso) {
  const d = parseISODate(iso);
  return {
    iso,
    weekday: WEEKDAYS_SHORT[d.getUTCDay()],
    weekdayLong: WEEKDAYS_LONG[d.getUTCDay()],
    day: d.getUTCDate(),
    month: MONTHS_SHORT[d.getUTCMonth()],
    monthLong: MONTHS_LONG[d.getUTCMonth()],
    year: d.getUTCFullYear(),
  };
}

/** The date strip: `count` days starting today. */
export function nextDays(count = 7, from = today()) {
  return Array.from({ length: count }, (_, i) => dateParts(addDays(from, i)));
}

/** "Tue 15 Sep" */
export function shortDate(iso) {
  const p = dateParts(iso);
  return `${p.weekday} ${p.day} ${p.month}`;
}

/** "Tuesday 15 September" */
export function longDate(iso) {
  const p = dateParts(iso);
  return `${p.weekdayLong} ${p.day} ${p.monthLong}`;
}

/** "In cinemas 2 October" */
export function releaseLabel(iso) {
  if (!iso) return 'Coming soon';
  const p = dateParts(iso);
  return `In cinemas ${p.day} ${p.monthLong}`;
}

/** Money is a plain lari number in the API: 24 -> "24", 14.5 -> "14.5" */
export function money(value) {
  const n = Math.round(Number(value) * 100) / 100;
  if (!Number.isFinite(n)) return '0';
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, '');
}

/**
 * A session's date and "HH:MM" moved by `minutes`, for display only
 * ("Refundable until 14:30, Tue 15 Sep"). Whether a refund is allowed is the API's call.
 */
export function shiftDateTime(date, time, minutes) {
  const [h, m] = time.split(':').map(Number);
  let total = h * 60 + m + minutes;
  let day = date;
  while (total < 0) {
    total += 1440;
    day = addDays(day, -1);
  }
  while (total >= 1440) {
    total -= 1440;
    day = addDays(day, 1);
  }
  return { date: day, time: `${pad(Math.floor(total / 60))}:${pad(total % 60)}` };
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** The API names halls "B"; the designs read "Hall B". */
export function hallLabel(hall) {
  const name = String(hall?.name ?? hall ?? '').trim();
  return /^hall/i.test(name) ? name : `Hall ${name}`;
}

/** "film" -> "Film" */
export function kindLabel(kind = 'film') {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

/** What to call the signed-in user: full name once the profile has one, otherwise the username. */
export function displayName(user) {
  return user?.fullName?.trim() || user?.username || '';
}

/** ['Adult', 'Adult', 'Child'] -> "2 x Adult, 1 x Child" */
export function ticketBreakdown(typeNames) {
  const counts = new Map();
  typeNames.forEach((name) => counts.set(name, (counts.get(name) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `${count} x ${name}`)
    .join(', ');
}

/** "Morning (before 12:00)" -> { name: 'Morning', hint: 'before 12:00' } */
export function splitBandLabel(label = '') {
  const match = /^(.*?)\s*\((.*)\)\s*$/.exec(label);
  if (!match) return { name: label, hint: '' };
  return { name: match[1], hint: match[2].replace(/\s+-\s+/g, '–') };
}

/** "4 September 2026" */
export function fullDate(iso) {
  if (!iso) return '';
  const p = dateParts(iso);
  return `${p.day} ${p.monthLong} ${p.year}`;
}

/**
 * Three-letter language code for the showtime tiles. /sessions sends `code`;
 * /movies/{movie}/sessions does not, so it is read off the slug or name there.
 */
export function languageCode(language) {
  if (language?.code) return language.code;
  const key = `${language?.slug ?? ''} ${language?.name ?? ''}`.toLowerCase();
  if (key.includes('georgian')) return 'GEO';
  if (key.includes('english') || key.includes('original')) return 'ENG';
  return (language?.name ?? '').slice(0, 3).toUpperCase();
}

/** The pill above a film's title: "PREMIERE · WEEK OF 15 SEPT" in its first two weeks, then "NOW PLAYING". */
export function statusTag(movie) {
  if (movie.isComingSoon) return 'Coming soon';
  if (movie.releaseDate) {
    const age = (parseISODate(today()) - parseISODate(movie.releaseDate)) / 86400000;
    if (age >= 0 && age < 14) {
      const weekday = (parseISODate(movie.releaseDate).getUTCDay() + 6) % 7; // Monday = 0
      const monday = dateParts(addDays(movie.releaseDate, -weekday));
      return `Premiere · Week of ${monday.day} ${monday.month === 'Sep' ? 'Sept' : monday.month}`;
    }
  }
  return 'Now playing';
}

/** Sessions of one venue, split by hall and kept in showtime order: [{ hall, sessions }] */
export function groupByHall(sessions) {
  const halls = [];
  [...sessions]
    .sort((a, b) => a.time.localeCompare(b.time))
    .forEach((session) => {
      const key = session.hall?.id ?? session.hall?.name;
      let group = halls.find((h) => h.key === key);
      if (!group) halls.push((group = { key, hall: session.hall, sessions: [] }));
      group.sessions.push(session);
    });
  return halls.sort((a, b) => String(a.hall?.name ?? '').localeCompare(String(b.hall?.name ?? '')));
}

/** Whole years between a date of birth and today. */
export function ageFrom(dateOfBirth, on = today()) {
  const [by, bm, bd] = dateOfBirth.split('-').map(Number);
  const [y, m, d] = on.split('-').map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}
