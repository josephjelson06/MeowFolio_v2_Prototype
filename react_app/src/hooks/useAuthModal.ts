import { useUiContext } from 'state/ui/uiContext';

export function useAuthModal() {
  const { authOpen, authConfig, openAuth, closeAuth } = useUiContext();
  return { authOpen, authConfig, openAuth, closeAuth };
}
