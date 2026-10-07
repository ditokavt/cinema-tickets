import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, tokenStore } from '../api';
import { nextDays } from '../lib/format.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [filterOptions, setFilterOptions] = useState(null);
  const [optionsError, setOptionsError] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'signup' | null
  const [reminders, setReminders] = useState([]); // slugs notified during this visit
  const [ticketsVersion, setTicketsVersion] = useState(0);
  const [toastState, setToastState] = useState(null); // { id, message, tone }
  const afterAuth = useRef(null);
  const toastTimer = useRef(null);

  /** One short message at the bottom of the screen. tone: 'info' | 'error' | 'success' */
  const toast = useCallback((message, tone = 'info') => {
    clearTimeout(toastTimer.current);
    setToastState({ id: Date.now(), message, tone });
    toastTimer.current = setTimeout(() => setToastState(null), 5000);
  }, []);
  const dismissToast = useCallback(() => {
    clearTimeout(toastTimer.current);
    setToastState(null);
  }, []);

  const loadOptions = useCallback(() => {
    setOptionsError(null);
    api.getFilterOptions().then(setFilterOptions).catch(setOptionsError);
  }, []);

  // Boot: filter options are fetched once and cached; a stored token restores the session.
  useEffect(() => {
    loadOptions();
    if (!tokenStore.get()) {
      setAuthReady(true);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => tokenStore.set(null)) // stale token: carry on as a guest
      .finally(() => setAuthReady(true));
  }, [loadOptions]);

  /** Open the login or sign-up modal. `then` is replayed once the user is signed in. */
  const openAuth = useCallback((mode = 'login', then = null) => {
    if (then) afterAuth.current = then;
    setAuthModal(mode);
  }, []);

  const closeAuth = useCallback(() => {
    afterAuth.current = null;
    setAuthModal(null);
  }, []);

  const finishAuth = useCallback((signedIn) => {
    setUser(signedIn);
    setAuthModal(null);
    const replay = afterAuth.current;
    afterAuth.current = null;
    if (replay) replay(signedIn);
  }, []);

  const login = useCallback(async (credentials) => finishAuth((await api.login(credentials)).user), [finishAuth]);
  const register = useCallback(async (details) => finishAuth((await api.register(details)).user), [finishAuth]);

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    tokenStore.set(null);
    setUser(null);
    setReminders([]);
  }, []);

  /**
   * A 401 from anywhere but /login means the token is gone: drop it, open the
   * login modal and replay the action once signed in. Returns true if handled.
   */
  const handleUnauthorized = useCallback(
    (error, replay) => {
      if (error?.status !== 401) return false;
      tokenStore.set(null);
      setUser(null);
      openAuth('login', replay);
      return true;
    },
    [openAuth],
  );

  const updateProfile = useCallback(async (profile) => {
    const updated = await api.updateProfile(profile);
    setUser(updated);
    return updated;
  }, []);

  /** Run `then` for a signed-in user; a guest gets the login modal first and `then` afterwards. */
  const requireAuth = useCallback(
    (then) => {
      if (user) then(user);
      else openAuth('login', then);
    },
    [user, openAuth],
  );

  /** "Notify Me" on a coming-soon title. Resolves once the API has stored the reminder. */
  const notify = useCallback(
    (slug) => {
      const send = () => {
        setReminders((list) => (list.includes(slug) ? list : [...list, slug]));
        api.notify(slug).catch((error) => {
          setReminders((list) => list.filter((s) => s !== slug));
          if (!handleUnauthorized(error, send)) toast(error.message || 'Could not set the reminder. Please try again.', 'error');
        });
      };
      requireAuth(send);
    },
    [requireAuth, handleUnauthorized, toast],
  );

  const dates = useMemo(() => nextDays(7), []);

  const value = useMemo(
    () => ({
      filterOptions,
      optionsError,
      reloadOptions: loadOptions,
      dates,
      user,
      authReady,
      profileComplete: Boolean(user?.profileComplete),
      authModal,
      openAuth,
      closeAuth,
      login,
      register,
      logout,
      requireAuth,
      handleUnauthorized,
      updateProfile,
      toast,
      toastState,
      dismissToast,
      reminders,
      notify,
      ticketsVersion,
      refreshTickets: () => setTicketsVersion((v) => v + 1),
    }),
    [filterOptions, optionsError, loadOptions, dates, user, authReady, authModal, openAuth, closeAuth, login, register, logout, requireAuth, handleUnauthorized, updateProfile, toast, toastState, dismissToast, reminders, notify, ticketsVersion],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
