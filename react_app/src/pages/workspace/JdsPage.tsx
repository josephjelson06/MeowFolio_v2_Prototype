import { useEffect, useMemo, useState } from 'react';
import { useViewportMode } from 'hooks/useViewportMode';
import { JdListPane } from 'components/jds/JdListPane';
import { JdMobileSheet } from 'components/jds/JdMobileSheet';
import { JdResultPane } from 'components/jds/JdResultPane';
import { ResumePickerPane } from 'components/jds/ResumePickerPane';
import { useJdModal } from 'hooks/useJdModal';
import { downloadTextFile } from 'lib/formatters';
import { jdService, type JdReportModel } from 'services/jdService';

const JD_PAGE_SIZE = 5;

function getPageForId(items: Array<{ id: number }>, id: number | null) {
  if (!id) return 1;
  const index = items.findIndex(item => item.id === id);
  return index === -1 ? 1 : Math.floor(index / JD_PAGE_SIZE) + 1;
}

export function JdsPage() {
  const { isMobile } = useViewportMode();
  const { openJd } = useJdModal();
  const [jds, setJds] = useState(() => jdService.list());
  const [jdPage, setJdPage] = useState(1);
  const [selectedJdId, setSelectedJdId] = useState<number | null>(jds[0]?.id ?? null);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<{ resumeKey: string; jdId: number } | null>(null);
  const [mobileView, setMobileView] = useState<'workspace' | 'report'>('workspace');
  const [sheetOpen, setSheetOpen] = useState(false);

  const pageItems = useMemo(() => {
    const start = (jdPage - 1) * JD_PAGE_SIZE;
    return jds.slice(start, start + JD_PAGE_SIZE);
  }, [jdPage, jds]);

  const totalPages = Math.max(1, Math.ceil(jds.length / JD_PAGE_SIZE));
  const selectedJd = useMemo(() => jds.find(item => item.id === selectedJdId) ?? null, [jds, selectedJdId]);
  const resumeProfiles = useMemo(() => Object.entries(jdService.getMatchProfiles()).map(([key, profile]) => ({ key, profile })), []);
  const report: JdReportModel | null = useMemo(() => {
    if (!lastAnalysis) return null;
    return jdService.buildReport(lastAnalysis.resumeKey, lastAnalysis.jdId);
  }, [lastAnalysis]);

  useEffect(() => {
    function handleJdSubmit(event: Event) {
      const customEvent = event as CustomEvent<{ text: string; sourceName?: string }>;
      const next = jdService.addFromText(customEvent.detail.text, customEvent.detail.sourceName);
      setJds(next.list);
      setSelectedJdId(next.jd.id);
      setJdPage(getPageForId(next.list, next.jd.id));
      setLastAnalysis(null);
      setMobileView('workspace');
      setSheetOpen(false);
    }

    window.addEventListener('resumeai:jd-submit', handleJdSubmit as EventListener);
    return () => window.removeEventListener('resumeai:jd-submit', handleJdSubmit as EventListener);
  }, []);

  useEffect(() => {
    if (!jds.length) {
      setSelectedJdId(null);
      setLastAnalysis(null);
      return;
    }

    if (!jds.find(item => item.id === selectedJdId)) {
      setSelectedJdId(jds[0].id);
    }
  }, [jds, selectedJdId]);

  useEffect(() => {
    if (!isMobile) {
      setMobileView('workspace');
      setSheetOpen(false);
    }
  }, [isMobile]);

  function runAnalysis() {
    if (!selectedResume || !selectedJdId) return;
    setLastAnalysis({ resumeKey: selectedResume, jdId: selectedJdId });
    if (isMobile) {
      setMobileView('workspace');
      setSheetOpen(true);
    }
  }

  function renameJd(id: number) {
    const jd = jdService.getById(id);
    if (!jd) return;
    const nextName = window.prompt('Edit JD name', jd.title);
    if (!nextName || !nextName.trim()) return;
    setJds(jdService.rename(id, nextName.trim()));
  }

  function downloadJd(id: number) {
    const jd = jdService.getById(id);
    if (!jd) return;
    downloadTextFile(`${jd.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_jd.txt`, jd.parsedText);
  }

  function deleteJd(id: number) {
    const next = jdService.remove(id);
    setJds(next);

    if (lastAnalysis?.jdId === id) {
      setLastAnalysis(null);
    }

    const nextSelected = next.find(item => item.id === selectedJdId) ? selectedJdId : next[0]?.id ?? null;
    setSelectedJdId(nextSelected);
    setJdPage(current => Math.min(current, Math.max(1, Math.ceil(next.length / JD_PAGE_SIZE))));
    setSheetOpen(false);
  }

  const analyzeTitle = selectedJd ? `${selectedJd.title} - ${selectedJd.company}` : 'No saved JDs';
  const analyzeSubtitle = selectedJd
    ? 'Choose a resume and run the same match workflow across desktop and mobile.'
    : 'Add a JD from the list to continue matching resumes.';

  return (
    <>
      <div className="mob-edit-toggle jd-mobile-tabs">
        <button className={`mob-et-btn${mobileView === 'workspace' ? ' active' : ''}`} type="button" onClick={() => setMobileView('workspace')}>Workspace</button>
        <button className={`mob-et-btn${mobileView === 'report' ? ' active' : ''}`} type="button" onClick={() => setMobileView('report')}>Detailed Report</button>
      </div>

      <main className={`jd-page-body jd-page${mobileView === 'report' ? ' report-view' : ''}`}>
        <JdListPane
          items={pageItems}
          activeId={selectedJdId}
          totalCount={jds.length}
          page={jdPage}
          totalPages={totalPages}
          onSelect={id => {
            setSelectedJdId(id);
            setJdPage(getPageForId(jds, id));
            setLastAnalysis(null);
            setSheetOpen(false);
          }}
          onAdd={openJd}
          onPrev={() => setJdPage(current => Math.max(1, current - 1))}
          onNext={() => setJdPage(current => Math.min(totalPages, current + 1))}
          onRename={renameJd}
          onDownload={downloadJd}
          onDelete={deleteJd}
        />

        <section className="jd-analyze-pane">
          <div className="jd-analyze-head">
            <div>
              <div className="jd-analyze-title">{analyzeTitle}</div>
              <div className="jd-analyze-sub">{analyzeSubtitle}</div>
            </div>
            <button className="run-btn" type="button" onClick={runAnalysis} disabled={!selectedResume || !selectedJd}>
              Run Analysis &rarr;
            </button>
          </div>

          <div className="jd-analyze-body">
            <ResumePickerPane items={resumeProfiles} activeKey={selectedResume} onSelect={key => {
              setSelectedResume(key);
              setLastAnalysis(null);
              setSheetOpen(false);
            }} />

            <div className="jd-result-col">
              <div id="jd-results">
                <JdResultPane report={report} selected={Boolean(selectedJd)} />
              </div>
              <div className={`jd-mobile-report-content${mobileView === 'report' ? '' : ' hidden'}`}>
                <JdResultPane
                  report={report}
                  selected={Boolean(selectedJd)}
                  detailed
                  onBackToWorkspace={() => setMobileView('workspace')}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <JdMobileSheet
        report={report}
        open={sheetOpen}
        onToggle={() => setSheetOpen(current => !current)}
        onOpenDetailed={() => {
          setSheetOpen(false);
          setMobileView('report');
        }}
      />
    </>
  );
}
