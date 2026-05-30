import { useEffect } from 'react';

/** Marks the document when running as an installed home-screen / PWA app. */
export function useStandalone() {
  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    document.documentElement.classList.toggle('standalone', standalone);
    document.documentElement.classList.toggle('touch-device', 'ontouchstart' in window);
  }, []);
}
