'use client';

import { useEffect, useState } from 'react';

/**
 * Returns the current document direction: 'ltr' or 'rtl'.
 * Defaults to the provided default (defaults to 'ltr') until the document is available.
 */
export function useDirection(defaultDir: 'ltr' | 'rtl' = 'ltr'): 'ltr' | 'rtl' {
  const [dir, setDir] = useState<'ltr' | 'rtl'>(() => {
    if (typeof document === 'undefined') return defaultDir;
    return ((document.documentElement?.dir as 'ltr' | 'rtl') || defaultDir);
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const read = () => {
      const d = (document.documentElement?.dir as 'ltr' | 'rtl') || defaultDir;
      setDir(d);
    };

    read();

    // Watch for changes to the `dir` attribute (some apps toggle it dynamically)
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'dir') {
          read();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });

    return () => observer.disconnect();
  }, [defaultDir]);

  return dir;
}

/**
 * Convenience hook that returns true when the direction is LTR.
 */
export function useIsLTR(defaultDir: 'ltr' | 'rtl' = 'ltr') {
  const dir = useDirection(defaultDir);
  return dir === 'ltr';
}
