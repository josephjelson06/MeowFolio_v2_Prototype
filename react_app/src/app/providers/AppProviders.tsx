import type { PropsWithChildren } from 'react';
import { UiProvider } from 'state/ui/uiContext';

export function AppProviders({ children }: PropsWithChildren) {
  return <UiProvider>{children}</UiProvider>;
}
