import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { AuthModalConfig, JdActionModalTarget, ResumeActionModalTarget } from 'types/ui';

const defaultAuthConfig: AuthModalConfig = {
  title: 'Continue with Google',
 };

interface UiContextValue {
  authOpen: boolean;
  resumeOpen: boolean;
  jdOpen: boolean;
  resumeRenameTarget: ResumeActionModalTarget | null;
  resumeDeleteTarget: ResumeActionModalTarget | null;
  jdRenameTarget: JdActionModalTarget | null;
  jdDeleteTarget: JdActionModalTarget | null;
  logoutOpen: boolean;
  authConfig: AuthModalConfig;
  openAuth: (nextConfig?: Partial<AuthModalConfig>) => void;
  closeAuth: () => void;
  openResume: () => void;
  closeResume: () => void;
  openJd: () => void;
  closeJd: () => void;
  openResumeRename: (target: ResumeActionModalTarget) => void;
  closeResumeRename: () => void;
  openResumeDelete: (target: ResumeActionModalTarget) => void;
  closeResumeDelete: () => void;
  openJdRename: (target: JdActionModalTarget) => void;
  closeJdRename: () => void;
  openJdDelete: (target: JdActionModalTarget) => void;
  closeJdDelete: () => void;
  openLogout: () => void;
  closeLogout: () => void;
  closeAll: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: PropsWithChildren) {
  const [authOpen, setAuthOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [jdOpen, setJdOpen] = useState(false);
  const [resumeRenameTarget, setResumeRenameTarget] = useState<ResumeActionModalTarget | null>(null);
  const [resumeDeleteTarget, setResumeDeleteTarget] = useState<ResumeActionModalTarget | null>(null);
  const [jdRenameTarget, setJdRenameTarget] = useState<JdActionModalTarget | null>(null);
  const [jdDeleteTarget, setJdDeleteTarget] = useState<JdActionModalTarget | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [authConfig, setAuthConfig] = useState<AuthModalConfig>(defaultAuthConfig);

  const value = useMemo<UiContextValue>(() => ({
    authOpen,
    resumeOpen,
    jdOpen,
    resumeRenameTarget,
    resumeDeleteTarget,
    jdRenameTarget,
    jdDeleteTarget,
    logoutOpen,
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
    openResumeRename: target => setResumeRenameTarget(target),
    closeResumeRename: () => setResumeRenameTarget(null),
    openResumeDelete: target => setResumeDeleteTarget(target),
    closeResumeDelete: () => setResumeDeleteTarget(null),
    openJdRename: target => setJdRenameTarget(target),
    closeJdRename: () => setJdRenameTarget(null),
    openJdDelete: target => setJdDeleteTarget(target),
    closeJdDelete: () => setJdDeleteTarget(null),
    openLogout: () => setLogoutOpen(true),
    closeLogout: () => setLogoutOpen(false),
    closeAll: () => {
      setAuthOpen(false);
      setResumeOpen(false);
      setJdOpen(false);
      setResumeRenameTarget(null);
      setResumeDeleteTarget(null);
      setJdRenameTarget(null);
      setJdDeleteTarget(null);
      setLogoutOpen(false);
    },
  }), [
    authConfig,
    authOpen,
    jdDeleteTarget,
    jdOpen,
    jdRenameTarget,
    logoutOpen,
    resumeDeleteTarget,
    resumeOpen,
    resumeRenameTarget,
  ]);

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUiContext() {
  const context = useContext(UiContext);
  if (!context) throw new Error('useUiContext must be used inside UiProvider');
  return context;
}
