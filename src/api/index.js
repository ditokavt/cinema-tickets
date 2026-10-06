/**
 * The one import every screen uses:  import { api } from '../api';
 *
 * Default            -> src/api/endpoints.js, the real Kino XII API
 * VITE_USE_MOCK=true -> src/api/mock.js, the same contract served in the browser
 */
import * as real from './endpoints.js';
import * as mock from './mock.js';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
export const api = USE_MOCK ? mock : real;
export { ApiError, tokenStore } from './client.js';
