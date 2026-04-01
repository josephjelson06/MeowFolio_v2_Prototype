import type { PropsWithChildren } from 'react';
import { SessionProvider } from 'state/session/sessionContext';
import { UiProvider } from 'state/ui/uiContext';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <UiProvider>{children}</UiProvider>
    </SessionProvider>
  );
}
