import { venues } from './venues.js';

/**
 * Seeded accounts for the mock API, shaped like the API's User.
 * - merisanikidze@gmail.com: the account drawn in the designs, profile incomplete (no date of birth)
 * - jane@kinoxii.test: the account the real API seeds, profile complete
 * Any other e-mail signs in as a fresh, incomplete account. Any password of 3+ characters works ("wrong" is rejected, to try the error state).
 */
export const seededUsers = {
  'merisanikidze@gmail.com': {
    id: 1,
    username: 'meri',
    email: 'merisanikidze@gmail.com',
    avatar: null,
    fullName: 'Meri Sanikidze',
    mobileNumber: '555123456',
    dateOfBirth: null,
    age: null,
    preferredVenue: null,
    profileComplete: false,
  },
  'jane@kinoxii.test': {
    id: 2,
    username: 'jane',
    email: 'jane@kinoxii.test',
    avatar: '/images/avatar-meri.jpg',
    fullName: 'Meri Sanikidze',
    mobileNumber: '555123456',
    dateOfBirth: '1996-04-12',
    age: 30,
    preferredVenue: venues[0],
    profileComplete: true,
  },
};
