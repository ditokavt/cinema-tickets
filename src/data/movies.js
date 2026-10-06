import { addDays, today } from '../lib/format.js';
import { ageRatings, formats } from './venues.js';

/** Catalogue mock, shaped like the API's Movie / MovieDetail. */
const rating = (code) => ageRatings.find((r) => r.code === code);
const rating12 = rating('12+');
const genre = (id, name) => ({ id, slug: name.toLowerCase().replace(/\s+/g, '-'), name });
const pick = (...slugs) => formats.filter((x) => slugs.includes(x.slug));

function movie(id, slug, title, genreName, extra) {
  return {
    id,
    slug,
    title,
    kind: 'film',
    runtimeMinutes: 134,
    posterUrl: `/images/posters/${slug}.jpg`,
    backdropUrl: `/images/posters/${slug}.jpg`,
    releaseDate: addDays(today(), -11),
    isComingSoon: false,
    isNotified: false,
    isFeatured: false,
    fromPrice: 16,
    ageRating: rating12,
    genres: [genre(id, genreName)],
    formats: pick('standard', 'max', 'panorama'),
    ...extra,
  };
}

export const movies = [
  movie(1, 'the-odyssey', 'The Odyssey', 'Drama', {
    isFeatured: true,
    backdropUrl: '/images/backdrops/the-odyssey.jpg',
    formats: pick('max', 'panorama'),
    synopsis:
      'A king spends ten years finding his way home from a war he already won, while monsters, gods, and his own restlessness make sure the return takes longer than the fighting did. By the time land comes back into view, the man arriving is not quite the one who left',
    director: 'Elene Kapanadze',
    cast: 'David Merabishvili, Ana Lomidze, Giorgi Tskhadadze, Mariam Beridze',
  }),
  movie(2, 'avengers-doomsday', 'Avengers: Doomsday', 'Action', {
    isFeatured: true,
    backdropUrl: '/images/backdrops/avengers-doomsday.jpg',
    releaseDate: addDays(today(), -30),
    synopsis: 'Scattered teams are pulled back together when a single masked ruler starts rewriting who gets to exist.',
    director: 'Nika Japaridze',
    cast: 'Luka Abashidze, Salome Gelashvili, Irakli Chanturia',
  }),
  movie(3, 'spider-man', 'Spider-Man', 'Action', {
    isFeatured: true,
    releaseDate: addDays(today(), -24),
    synopsis: 'Starting over with nobody who remembers him, a young hero finds the city has kept its own account of what he owes.',
    director: 'Tamar Kvaratskhelia',
    cast: 'Sandro Mchedlidze, Nino Tsereteli, Levan Dolidze',
  }),
  movie(4, 'dune-part-three', 'Dune: Part Three', 'Sci-Fi', {
    isFeatured: true,
    releaseDate: addDays(today(), -5),
    synopsis: 'Years into a reign built on a war he could not stop, an emperor learns the future he saw is arriving in a different shape.',
    director: 'Giorgi Maisuradze',
    cast: 'Keti Khutsishvili, Beka Sharashidze, Ana Lomidze',
  }),
  movie(5, 'the-father', 'The Father', 'Drama', {
    fromPrice: 12,
    synopsis: 'A man refuses help from his daughter as the flat, the faces and the hours around him stop holding still.',
    director: 'Mariam Beridze',
    cast: 'Zurab Kipshidze, Nato Murvanidze',
  }),
  movie(6, 'the-batman', 'The Batman', 'Crime', {
    isComingSoon: true,
    releaseDate: addDays(today(), 24),
    synopsis: 'Two years into the job, a masked detective follows a trail of riddles into the city’s oldest families.',
    director: 'Irakli Chanturia',
    cast: 'Luka Abashidze, Nino Tsereteli',
  }),
  movie(7, 'the-brutalist', 'The Brutalist', 'Drama', {
    synopsis: 'An architect rebuilding his life abroad is offered the commission of a lifetime by a patron who expects to own the result.',
    director: 'Davit Gogichaishvili',
    cast: 'Otar Megvinetukhutsesi, Tinatin Dalakishvili',
  }),
  movie(8, 'the-cartographers-wife', 'The Cartographer’s Wife', 'Drama', {
    isComingSoon: true,
    posterUrl: '/images/posters/the-odyssey.jpg',
    backdropUrl: '/images/posters/the-odyssey.jpg',
    releaseDate: addDays(today(), 17),
    synopsis:
      'While her husband maps a coast he will never sail, she keeps a second atlas of the places he leaves out, and it becomes the more accurate of the two.',
    director: 'Elene Kapanadze',
    cast: 'Ana Lomidze, Giorgi Tskhadadze',
  }),
  movie(9, 'joker', 'Joker', 'Thriller', {
    runtimeMinutes: 122,
    fromPrice: 14,
    ageRating: rating('16+'),
    releaseDate: addDays(today(), -40),
    formats: pick('standard', 'atmos'),
    synopsis: 'A failed comedian, ignored by the city he performs for, finds that the mask he puts on gets the attention he never did.',
    director: 'Nika Japaridze',
    cast: 'Irakli Chanturia, Salome Gelashvili',
  }),
  movie(10, 'nine-red-doors', 'Nine Red Doors', 'Thriller', {
    runtimeMinutes: 102,
    fromPrice: 14,
    ageRating: rating('16+'),
    releaseDate: addDays(today(), -18),
    formats: pick('standard', 'motion'),
    synopsis: 'Every night a new door appears on the same quiet street, and the neighbours who walk through one do not come back as themselves.',
    director: 'Tamar Kvaratskhelia',
    cast: 'Levan Dolidze, Keti Khutsishvili',
  }),
  movie(11, 'the-drama', 'The Drama', 'Romance', {
    isComingSoon: true,
    runtimeMinutes: 106,
    releaseDate: addDays(today(), 9),
    synopsis: 'A week before the wedding, one honest answer to a harmless question sends the couple and everyone invited into a spiral.',
    director: 'Mariam Beridze',
    cast: 'Ana Lomidze, Sandro Mchedlidze',
  }),
  movie(12, 'project-hail-mary', 'Project Hail Mary', 'Sci-Fi', {
    isComingSoon: true,
    runtimeMinutes: 156,
    releaseDate: addDays(today(), 13),
    synopsis: 'A schoolteacher wakes up alone on a ship light-years from home with no memory of the mission that is supposed to save the Sun.',
    director: 'Giorgi Maisuradze',
    cast: 'Luka Abashidze, Nino Tsereteli',
  }),
  movie(13, 'michael', 'Michael', 'Biography', {
    isComingSoon: true,
    runtimeMinutes: 128,
    releaseDate: addDays(today(), 20),
    synopsis: 'From a family band in Gary, Indiana to the biggest stage on earth: the making of a performer the world could not stop watching.',
    director: 'Davit Gogichaishvili',
    cast: 'Beka Sharashidze, Tinatin Dalakishvili',
  }),
];

/** Row orders drawn on the Home frame. Anything not listed follows in catalogue order. */
export const NOW_PLAYING_ORDER = ['the-odyssey', 'spider-man', 'dune-part-three', 'avengers-doomsday', 'joker', 'nine-red-doors'];
export const COMING_SOON_ORDER = ['the-drama', 'project-hail-mary', 'michael'];

export function inOrder(list, order) {
  const rank = (m) => (order.includes(m.slug) ? order.indexOf(m.slug) : order.length);
  return [...list].sort((a, b) => rank(a) - rank(b));
}

export const movieBySlug = Object.fromEntries(movies.map((m) => [m.slug, m]));

/** The list endpoints leave out the detail-only fields. */
export function summary(m) {
  const { director, cast, synopsis, ...rest } = m;
  return rest;
}
