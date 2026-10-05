/**
 * "Recently viewed" on the Home page. Kept in localStorage so it is there for
 * guests as well as signed-in visitors; newest first, each film once.
 */
const KEY = 'kino.recent';
const LIMIT = 8;

export function readRecent() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function rememberMovie(movie) {
  if (!movie?.slug) return;
  const { id, slug, title, runtimeMinutes, posterUrl, backdropUrl, ageRating, genres } = movie;
  const entry = { id, slug, title, runtimeMinutes, posterUrl, backdropUrl, ageRating, genres };
  try {
    const next = [entry, ...readRecent().filter((m) => m.slug !== slug)].slice(0, LIMIT);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or unavailable */
  }
}
