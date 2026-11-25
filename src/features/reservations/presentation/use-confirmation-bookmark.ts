import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { BookingApplication } from '../application/booking-application';

// Only an opaque ID is retained. Display data must come from the authenticated
// own-reservations read again; a bookmark can never authorize or create a booking.
export function useConfirmationBookmark(app: BookingApplication) {
  const scope = app.getScope?.();
  const key = scope
    ? `barbexa:confirmation:${scope.userId}:${scope.contextKey}`
    : '';
  const [loading, setLoading] = useState(() => {
    if (Platform.OS !== 'web' || !key || app.getSnapshot().result) return false;
    try {
      return !!sessionStorage.getItem(key);
    } catch {
      return false;
    }
  });
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'web' || !key || app.getSnapshot().result) return;
    let id: string | null = null;
    try {
      id = sessionStorage.getItem(key);
    } catch {
      return;
    }
    if (!id) return;
    let active = true;
    void app
      .restoreConfirmation(id)
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [app, key, retry]);
  const result = app.getSnapshot().result;
  useEffect(() => {
    if (Platform.OS !== 'web' || !key || !result) return;
    try {
      sessionStorage.setItem(key, result.detail.id);
    } catch {
      /* Storage is optional. */
    }
  }, [key, result]);
  return {
    loading,
    error,
    retry: () => {
      setLoading(true);
      setError(false);
      setRetry((value) => value + 1);
    },
    forget: () => {
      if (Platform.OS === 'web' && key) {
        try {
          sessionStorage.removeItem(key);
        } catch {
          /* Read-only recovery remains available in My reservations. */
        }
      }
      setError(false);
      setLoading(false);
    },
  };
}
