import { ageFrom, today } from '../../lib/format.js';

export const MIN_AGE = 12;
const strip = (v) => String(v ?? '').replace(/\s+/g, '');

/** Profile rules and their messages, word for word from the brief. */
export const profileRules = {
  fullName: (v) => {
    const name = String(v ?? '').trim();
    if (!name) return 'Name is required';
    if (name.length < 3) return 'Name must be at least 3 characters';
    if (name.length > 50) return 'Name must not exceed 50 characters';
    return '';
  },
  mobileNumber: (v) => {
    const mobile = strip(v);
    if (!mobile) return 'Mobile number is required';
    if (!/^\d+$/.test(mobile)) return 'Please enter a valid Georgian mobile number (9 digits starting with 5)';
    if (!mobile.startsWith('5')) return 'Georgian mobile numbers must start with 5';
    if (mobile.length !== 9) return 'Mobile number must be exactly 9 digits';
    return '';
  },
  dateOfBirth: (v) => {
    if (!v) return 'Date of birth is required';
    const date = new Date(`${v}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== v) return 'Please enter a valid date of birth';
    if (v > today() || v < '1900-01-01') return 'Please enter a valid date of birth';
    if (ageFrom(v) < MIN_AGE) return 'You must be at least 12 years old to create an account';
    return '';
  },
};

export const PROFILE_FIELDS = Object.keys(profileRules);
export const isProfileValid = (values) => PROFILE_FIELDS.every((name) => !profileRules[name](values[name]));

/**
 * The age note under Date of birth, shown only when the account is too young
 * for some ratings: "You are 14. You cannot buy tickets for 16+ or 18+ titles."
 * An account old enough for everything gets no note, as in the design.
 */
export function eligibility(age, ageRatings = []) {
  if (age === null || age === undefined || Number.isNaN(age)) return undefined;
  const blocked = ageRatings.filter((r) => r.minAge > age).map((r) => r.code);
  return blocked.length ? `You are ${age}. You cannot buy tickets for ${blocked.join(' or ')} titles.` : undefined;
}
