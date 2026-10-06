import { movies } from './movies.js';

/**
 * Home hero: always these four films, in this order, as in the design.
 * They do not come from the API (`/movies/featured` is not used any more).
 *
 * Background pictures come from src/assets/hero/<slug>.jpg (see heroImages.js).
 * Title, badges and text come from src/data/movies.js; `synopsis` here overrides it.
 * To change a slide, edit this list.
 */
const SLIDES = [
  { slug: 'the-odyssey' },
  {
    slug: 'avengers-doomsday',
    synopsis:
      "When one man convinced he's owed the throne of the world starts rewriting who's allowed to stop him, the planet's last line of defense has to become something bigger than any hero standing alone. Old rivalries get shelved fast when the alternative is having no world left to argue about",
  },
  {
    slug: 'spider-man',
    synopsis:
      'Starting over with a life the world has already rewritten and a name nobody quite trusts yet, a young hero has to prove the mask was never the easy part. Being someone new turns out to be harder than being someone hunted.',
  },
  {
    slug: 'dune-part-three',
    synopsis:
      'Years into a reign built on a vision he chose to fulfill, an emperor learns that surviving the future you foresaw and ruling it turn out to be two very different things. The throne he fought for starts to look less like a victory and more like a debt still coming due',
  },
];

export const heroSlides = SLIDES.map(({ slug, ...override }) => ({
  ...movies.find((m) => m.slug === slug),
  ...override,
}));
