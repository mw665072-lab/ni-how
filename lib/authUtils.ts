import { getCookie, getCookies, setCookie, deleteCookie, hasCookie } from 'cookies-next';

// Wrapper utilities around `cookies-next` for auth cookie handling.
// Using these wrappers keeps the rest of the app decoupled from the underlying cookie library.
export function getAuthToken(): string | null {
  try {
    const val = getCookie('authToken');
    console.log('Retrieved auth token from cookies:', val);
    if (typeof val === 'string') return val;
    // cookies-next may return a string or object depending on usage; coerce
    return val ?? null;
  } catch (err) {
    return null;
  }
}

export function setAuthToken(token: string, options?: { maxAge?: number }) {
  // maxAge in seconds; default to 7 days
  const maxAge = options?.maxAge ?? 7 * 24 * 60 * 60;
  try {
    setCookie('authToken', token, { path: '/', maxAge });
  } catch (err) {
    // ignore client/server mismatch silently
    // callers should still update client state
  }
}

export function clearAuthToken() {
  try {
    deleteCookie('authToken', { path: '/' });
  } catch (err) {
    // ignore
  }
}
