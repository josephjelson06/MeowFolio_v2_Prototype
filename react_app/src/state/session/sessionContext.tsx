import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { sessionService } from 'services/sessionService';
import type { SessionActor } from 'types/session';

interface SessionContextValue {
  actor: SessionActor | null;
  ready: boolean;
  initials: string;
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

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      try {
        const nextActor = await sessionService.bootstrap();
        if (alive) {
          setActor(nextActor);
        }
      } finally {
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

  const value = useMemo<SessionContextValue>(() => ({
    actor,
    initials: getInitials(actor),
    ready,
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
