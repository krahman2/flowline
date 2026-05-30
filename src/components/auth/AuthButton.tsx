import { useEffect, useRef, useState } from 'react';
import { Cloud, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthButton() {
  const { user, isConfigured, syncStatus, signInWithGoogle, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  if (!isConfigured) return null;

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setMenuOpen(false);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  const syncLabel =
    syncStatus === 'syncing'
      ? 'Saving…'
      : syncStatus === 'synced'
        ? 'Saved to cloud'
        : syncStatus === 'error'
          ? 'Sync error'
          : 'Sign in to save progress';

  if (!user) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleSignIn}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-60"
          title="Sign in with Google to save progress across devices"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
          <span className="hidden sm:inline">Sign in</span>
        </button>
        {error && <p className="max-w-[12rem] truncate text-[11px] text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white py-1.5 pl-1.5 pr-2.5 text-sm shadow-sm transition hover:bg-neutral-50"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="h-7 w-7 rounded-lg object-cover" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-flow-100 text-xs font-semibold text-flow-700">
            {(user.displayName ?? user.email ?? '?')[0]?.toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-[7rem] truncate font-medium text-neutral-700 sm:inline">
          {user.displayName?.split(' ')[0] ?? 'Account'}
        </span>
        {syncStatus === 'syncing' && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />}
        {syncStatus === 'synced' && <Cloud className="h-3.5 w-3.5 text-flow-500" />}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
          <div className="border-b border-neutral-100 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-neutral-900">
              {user.displayName ?? 'Signed in'}
            </p>
            <p className="truncate text-xs text-neutral-400">{user.email}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
              {syncStatus === 'syncing' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Cloud className="h-3 w-3" />
              )}
              {syncLabel}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={busy}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
