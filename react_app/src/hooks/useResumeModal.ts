import { useUiContext } from 'state/ui/uiContext';

export function useResumeModal() {
  const { resumeOpen, openResume, closeResume } = useUiContext();
  return { resumeOpen, openResume, closeResume };
}
