import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { AuthModalConfig } from 'types/ui';

const defaultAuthConfig: AuthModalConfig = {
  title: 'Continue with Google',
 };

interface UiContextValue {
  authOpen: boolean;
  resumeOpen: boolean;
  jdOpen: boolean;
  authConfig: AuthModalConfig;
  openAuth: (nextConfig?: Partial<AuthModalConfig>) => void;
  closeAuth: () => void;
  openResume: () => void;
  closeResume: () => void;
  openJd: () => void;
  closeJd: () => void;
  closeAll: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: PropsWithChildren) {
  const [authOpen, setAuthOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [jdOpen, setJdOpen] = useState(false);
  const [authConfig, setAuthConfig] = useState<AuthModalConfig>(defaultAuthConfig);

  const value = useMemo<UiContextValue>(() => ({
    authOpen,
    resumeOpen,
    jdOpen,
    authConfig,
    openAuth: nextConfig => {
      setAuthConfig(current => ({ ...current, ...defaultAuthConfig, ...nextConfig }));
      setAuthOpen(true);
    },
    closeAuth: () => setAuthOpen(false),
    openResume: () => setResumeOpen(true),
    closeResume: () => setResumeOpen(false),
    openJd: () => setJdOpen(true),
    closeJd: () => setJdOpen(false),
    closeAll: () => {
      setAuthOpen(false);
      setResumeOpen(false);
      setJdOpen(false);
    },
  }), [authConfig, authOpen, jdOpen, resumeOpen]);

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUiContext() {
  const context = useContext(UiContext);
  if (!context) throw new Error('useUiContext must be used inside UiProvider');
  return context;
}
