import { useState, type Dispatch, type SetStateAction } from 'react';
import { resumeService } from 'services/resumeService';
import type { AtsScoreResponse } from 'types/resumeDocument';

export function useEditorAts({
  isMobile,
  persistNow,
  setMobileView,
}: {
  isMobile: boolean;
  persistNow: () => Promise<{ id: string } | null>;
  setMobileView: Dispatch<SetStateAction<'edit' | 'preview' | 'ats'>>;
}) {
  const [atsReport, setAtsReport] = useState<AtsScoreResponse | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  function clearAtsReport() {
    setAtsReport(null);
  }

  async function runAtsAnalysis() {
    const currentRecord = await persistNow();
    if (!currentRecord) return;

    try {
      setAtsLoading(true);
      const report = await resumeService.scoreAts(currentRecord.id);
      setAtsReport(report);
      if (isMobile) {
        setMobileView('preview');
        setSheetOpen(true);
      } else {
        setDrawerOpen(true);
      }
    } finally {
      setAtsLoading(false);
    }
  }

  return {
    atsLoading,
    atsReport,
    clearAtsReport,
    drawerOpen,
    runAtsAnalysis,
    setAtsReport,
    setDrawerOpen,
    setSheetOpen,
    sheetOpen,
  };
}
