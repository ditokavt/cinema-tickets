/**
 * Mock of GET /filter-options, in the API's own shape. The labels follow the
 * designs; the live API is the source of truth for the real ones.
 */
const f = {
  standard: { id: 1, slug: 'standard', name: 'Standard', priceUplift: 0 },
  max: { id: 2, slug: 'max', name: 'MAX', priceUplift: 6 },
  atmos: { id: 3, slug: 'atmos', name: 'ATMOS', priceUplift: 4 },
  panorama: { id: 4, slug: 'panorama', name: 'PANORAMA', priceUplift: 5 },
  motion: { id: 5, slug: 'motion', name: 'MOTION', priceUplift: 8 },
};

export const formats = [f.standard, f.max, f.atmos, f.panorama, f.motion];

export const venues = [
  { id: 1, slug: 'galleria', name: 'Galleria Tbilisi', city: 'Tbilisi', formats: [f.atmos, f.max, f.motion, f.panorama, f.standard] },
  { id: 3, slug: 'rustaveli', name: 'Rustaveli Palace', city: 'Tbilisi', formats: [f.atmos, f.panorama, f.standard] },
  { id: 4, slug: 'vake', name: 'Vake Park', city: 'Tbilisi', formats: [f.max, f.motion, f.standard] },
  { id: 2, slug: 'batumi', name: 'Batumi Boulevard', city: 'Batumi', formats: [f.atmos, f.max, f.standard] },
];

export const languages = [
  { id: 1, slug: 'georgian-dub', name: 'Georgian Dub', code: 'GEO' },
  { id: 2, slug: 'georgian-subtitles', name: 'Georgian Sub', code: 'GEO' },
  { id: 3, slug: 'original-subtitles', name: 'Original + Subtitles', code: 'ENG' },
  { id: 4, slug: 'english-dub', name: 'English Dub', code: 'ENG' },
];

export const timeBands = [
  { id: 'morning', label: 'Morning (before 12:00)', from: '00:00', to: '12:00' },
  { id: 'afternoon', label: 'Afternoon (12:00 - 18:00)', from: '12:00', to: '18:00' },
  { id: 'evening', label: 'Evening (after 18:00)', from: '18:00', to: '24:00' },
];

export const ticketTypes = [
  { id: 1, slug: 'adult', name: 'Adult', priceRatio: 1, note: null, blockedFromRatingAge: null },
  { id: 2, slug: 'child', name: 'Child', priceRatio: 0.6, note: 'Not available for 16+ or 18+ titles.', blockedFromRatingAge: 16 },
  { id: 3, slug: 'student', name: 'Student', priceRatio: 0.75, note: 'Valid student ID required at entry.', blockedFromRatingAge: null },
];

export const ageRatings = [
  { code: 'G', minAge: 0, description: 'Suitable for all ages. No age check applies at the door.' },
  { code: 'PG', minAge: 0, description: 'Parental guidance advised. Younger viewers may need an adult present.' },
  { code: '12+', minAge: 12, description: 'Not recommended for under-12s. Tickets require an account aged 12 or over.' },
  { code: '16+', minAge: 16, description: 'Restricted to viewers aged 16 and over. Child tickets are unavailable.' },
  { code: '18+', minAge: 18, description: 'Restricted to viewers aged 18 and over. Photo ID may be requested at the door.' },
];

export const filterOptions = {
  venues,
  formats,
  languages,
  timeBands: timeBands.map(({ id, label }) => ({ id, label })),
  sorts: [
    { id: 'time_asc', label: 'Showtime: earliest first' },
    { id: 'time_desc', label: 'Showtime: latest first' },
    { id: 'price_asc', label: 'Price: low to high' },
    { id: 'price_desc', label: 'Price: high to low' },
    { id: 'title_asc', label: 'Title: A-Z' },
  ],
  ticketTypes,
  ageRatings,
  maxSeatsPerOrder: 3,
  holdMinutes: 8,
};
