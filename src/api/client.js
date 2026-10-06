/**
 * Thin fetch wrapper for the Kino XII REST API.
 *
 * Errors are normalised into ApiError so screens can follow the contract:
 *   401            -> open the login modal, then replay the action
 *   409            -> `contested` lists the seats someone else took
 *   422 + errors   -> field validation, map each key onto its input
 *   422, no errors -> a booking rule; show `message` as it comes
 */
export const API_URL = (import.meta.env.VITE_API_URL || 'https://api.kinoxii.redberryinternship.ge/api').replace(/\/$/, '');

const TOKEN_KEY = 'kino.token';

export class ApiError extends Error {
  constructor(status, message, { errors = null, contested = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.contested = contested;
  }

  /** 422 with field errors: a form problem. */
  get isValidation() {
    return this.status === 422 && Boolean(this.errors);
  }

  /** 422 without field errors: a booking rule, message is user-ready. */
  get isRule() {
    return this.status === 422 && !this.errors;
  }
}

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

export async function request(path, { method = 'GET', query, body, formData } = {}) {
  const url = new URL(API_URL + path);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(`${key}[]`, v));
    else url.searchParams.set(key, value);
  });

  const headers = { Accept: 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  // FormData sets its own multipart boundary; only JSON bodies get a content type here.
  if (body) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: formData ?? (body ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? 'Something went wrong. Please try again.', {
      errors: payload?.errors ?? null,
      contested: payload?.contested ?? null,
    });
  }
  return payload;
}
