import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { supabase } from 'lib/supabase';
import { sessionService } from 'services/sessionService';
import type { SessionActor } from 'types/session';

interface SessionContextValue {
  actor: SessionActor | null;
  ready: boolean;
  initials: string;
  credits: number;
  plan: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function getInitials(actor: SessionActor | null) {
  const name = actor?.name?.trim();
  if (!name) return 'AI';
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('') || 'AI';
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [actor, setActor] = useState<SessionActor | null>(null);
  const [ready, setReady] = useState(false);

  // Bootstrap: check for existing session on mount
  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      try {
        const nextActor = await sessionService.bootstrap();
        if (alive) setActor(nextActor);
      } finally {
        if (alive) setReady(true);
      }
    }

    void bootstrap();
    return () => { alive = false; };
  }, []);

  // Subscribe to auth state changes (login, logout, token refresh)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const nextActor = await sessionService.bootstrap();
          setActor(nextActor);
        } else if (event === 'SIGNED_OUT') {
          setActor(null);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionContextValue>(() => ({
    actor,
    ready,
    initials: getInitials(actor),
    credits: actor?.credits ?? 0,
    plan: actor?.plan ?? 'free',
    signIn: async () => {
      await sessionService.signInWithGoogle();
    },
    signOut: async () => {
      await sessionService.signOut();
      setActor(null);
    },
    refreshCredits: async () => {
      const refreshed = await sessionService.refreshProfile();
      if (refreshed) setActor(refreshed);
    },
  }), [actor, ready]);

  if (!ready) {
    return null;
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}
