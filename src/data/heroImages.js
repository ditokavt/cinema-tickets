/**
 * Hero banner images.
 *
 * By default each slide shows the film's own `backdropUrl` from the API.
 * To use your own pictures, drop them into  src/assets/hero/  and name them
 *
 *     1.jpg  2.jpg  3.jpg  4.jpg        -> slide 1, 2, 3, 4 (left to right)
 *
 * or after the film's slug, which always wins over the slide number:
 *
 *     the-odyssey.jpg                   -> the slide for /movie/the-odyssey
 *
 * .jpg, .jpeg, .png and .webp all work. Nothing else needs editing: files in
 * that folder are picked up automatically, and a slide without a file keeps
 * the API image. Around 1920×1180 (the design uses 1264×777) fills the banner.
 */
const files = import.meta.glob('../assets/hero/*.{jpg,jpeg,png,webp,avif}', { eager: true, query: '?url', import: 'default' });

const byName = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [
    path
      .split('/')
      .pop()
      .replace(/\.[^.]+$/, '')
      .toLowerCase(),
    url,
  ]),
);

/** `index` is the slide's position, starting at 0. */
export function heroImage(movie, index) {
  return byName[movie.slug?.toLowerCase()] ?? byName[String(index + 1)] ?? movie.backdropUrl ?? movie.posterUrl ?? null;
}
