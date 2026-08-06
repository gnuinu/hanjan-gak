import { useEffect } from 'react';
import { useSession } from '../store/session';

/** 게임 중 화면이 꺼지면 흐름이 끊긴다. 지원 안 되는 브라우저면 조용히 무시. */
export function useWakeLock() {
  const enabled = useSession((s) => s.settings.keepScreenAwake);

  useEffect(() => {
    if (!enabled) return;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> };
    };
    if (!nav.wakeLock) return;

    let lock: { release: () => Promise<void> } | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const next = await nav.wakeLock!.request('screen');
        if (cancelled) void next.release();
        else lock = next;
      } catch {
        /* 사용자가 거부했거나 배터리 절약 모드. 무시한다 */
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release();
    };
  }, [enabled]);
}
