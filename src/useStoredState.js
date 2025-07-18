import { useState, useEffect } from 'react';

export default function useStoredState(key, initial) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('storageError', { detail: { key, error: e } }));
    }
  }, [key, state]);

  return [state, setState];
}
