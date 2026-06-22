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
      console.log('[Auth Session] Starting bootstrap...');

      try {
        console.log('[Auth Session] Querying Supabase auth session...');
        const nextActor = await sessionService.bootstrap();
        console.log('[Auth Session] Supabase auth session resolved:', nextActor);
        
        if (alive) {
          setActor(nextActor);
          setReady(true);
          
          if (nextActor) {
            console.log('[Auth Session] Profile refresh triggered...');
            void sessionService.refreshProfile().then(refreshed => {
              if (alive && refreshed) {
                console.log('[Auth Session] Profile refreshed successfully:', refreshed);
                setActor(refreshed);
              }
            }).catch(err => {
              console.warn('[Auth Session] Profile refresh failed:', err);
            });
          }
        }
      } catch (error) {
        console.error('[Auth Session] Bootstrap exception caught:', error);
        if (alive) {
          setReady(true);
        }
      }
    }

    void bootstrap();
    return () => {
      alive = false;
    };
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

  // Listen to custom credit update events
  useEffect(() => {
    function handleCreditsUpdated(event: Event) {
      const customEvent = event as CustomEvent<{ credits: number }>;
      console.log('[Auth Session] Credits updated custom event caught:', customEvent.detail.credits);
      setActor(prev => prev ? { ...prev, credits: customEvent.detail.credits } : null);
    }

    window.addEventListener('meowfolio:credits-updated', handleCreditsUpdated);
    return () => {
      window.removeEventListener('meowfolio:credits-updated', handleCreditsUpdated);
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
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b', color: '#fafafa' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #333', borderTopColor: '#fafafa', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px' }}>Loading session...</p>
        </div>
      </div>
    );
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}
