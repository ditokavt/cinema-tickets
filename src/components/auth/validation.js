export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const SHORT = 'At least 3 characters';

/** Form rules from the brief: username and password need 3 characters, on sign-up and on login alike. */
export const rules = {
  email: (v) => (!v.trim() ? 'Email is required' : !isEmail(v) ? 'Enter a valid email address' : ''),
  password: (v) => (!v ? 'Password is required' : v.length < 3 ? SHORT : ''),
  username: (v) => (!v.trim() ? 'Username is required' : v.trim().length < 3 ? SHORT : ''),
  confirm: (v, password) => (!v ? 'Confirm your password' : v !== password ? 'Passwords do not match' : ''),
};

/** First message per field from a 422 `errors` payload. */
export function fieldErrors(apiError, map = {}) {
  const out = {};
  Object.entries(apiError?.errors ?? {}).forEach(([key, messages]) => {
    out[map[key] ?? key] = Array.isArray(messages) ? messages[0] : String(messages);
  });
  return out;
}
