import { useUiContext } from 'state/ui/uiContext';

export function useJdModal() {
  const { jdOpen, openJd, closeJd } = useUiContext();
  return { jdOpen, openJd, closeJd };
}
