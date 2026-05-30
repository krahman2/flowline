import { useEffect, useRef } from 'react';

/** Keeps the screen awake while a focus timer is running (Android / installed PWA). */
export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;

    let cancelled = false;

    const acquire = async () => {
      try {
        if (lockRef.current) return;
        lockRef.current = await navigator.wakeLock.request('screen');
        lockRef.current.addEventListener('release', () => {
          lockRef.current = null;
        });
      } catch {
        // Permission denied or unsupported — ignore
      }
    };

    void acquire();

    const onVisible = () => {
      if (!cancelled && document.visibilityState === 'visible' && active) void acquire();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lockRef.current?.release();
      lockRef.current = null;
    };
  }, [active]);
}
