import { useEffect, useMemo, useState } from 'react';
import { useViewportMode } from 'hooks/useViewportMode';
import { JdListPane } from 'components/jds/JdListPane';
import { JdMobileSheet } from 'components/jds/JdMobileSheet';
import { JdResultPane } from 'components/jds/JdResultPane';
import { ResumePickerPane } from 'components/jds/ResumePickerPane';
import { useJdModal } from 'hooks/useJdModal';
import { downloadTextFile } from 'lib/formatters';
import { jdService, type JdReportModel } from 'services/jdService';
import { resumeService } from 'services/resumeService';
import type { ResumePickerOption } from 'types/resume';

const JD_PAGE_SIZE = 5;

function getPageForId(items: Array<{ id: string }>, id: string | null) {
  if (!id) return 1;
  const index = items.findIndex(item => item.id === id);
  return index === -1 ? 1 : Math.floor(index / JD_PAGE_SIZE) + 1;
}

export function JdsPage() {
  const { isMobile } = useViewportMode();
  const { openJd } = useJdModal();
  const [jds, setJds] = useState<Awaited<ReturnType<typeof jdService.list>>>([]);
  const [jdPage, setJdPage] = useState(1);
  const [selectedJdId, setSelectedJdId] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'workspace' | 'report'>('workspace');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resumeProfiles, setResumeProfiles] = useState<ResumePickerOption[]>([]);
  const [reportState, setReportState] = useState<JdReportModel | null>(null);

  const pageItems = useMemo(() => {
    const start = (jdPage - 1) * JD_PAGE_SIZE;
    return jds.slice(start, start + JD_PAGE_SIZE);
  }, [jdPage, jds]);

  const totalPages = Math.max(1, Math.ceil(jds.length / JD_PAGE_SIZE));
  const selectedJd = useMemo(() => jds.find(item => item.id === selectedJdId) ?? null, [jds, selectedJdId]);

  useEffect(() => {
    async function loadJdData() {
      const [nextJds, nextProfiles] = await Promise.all([jdService.list(), jdService.getMatchProfiles()]);
      setJds(nextJds);
      setResumeProfiles(nextProfiles);
      setSelectedJdId(current => {
        const nextSelected = current && nextJds.some(item => item.id === current) ? current : nextJds[0]?.id ?? null;
        setJdPage(getPageForId(nextJds, nextSelected));
        return nextSelected;
      });
      setSelectedResume(current => current && nextProfiles.some(item => item.id === current) ? current : nextProfiles[0]?.id ?? null);
    }

    loadJdData();
    window.addEventListener(jdService.eventName, loadJdData);
    window.addEventListener(resumeService.eventName, loadJdData);
    return () => {
      window.removeEventListener(jdService.eventName, loadJdData);
      window.removeEventListener(resumeService.eventName, loadJdData);
    };
  }, [jds]);

  useEffect(() => {
    function handleJdSubmit(event: Event) {
      const customEvent = event as CustomEvent<{ id: string }>;
      if (customEvent.detail?.id) {
        setSelectedJdId(customEvent.detail.id);
        setJdPage(getPageForId(jds, customEvent.detail.id));
      }
      setReportState(null);
      setMobileView('workspace');
      setSheetOpen(false);
    }

    window.addEventListener(jdService.eventName, handleJdSubmit as EventListener);
    return () => window.removeEventListener(jdService.eventName, handleJdSubmit as EventListener);
  }, []);

  useEffect(() => {
    if (!jds.length) {
      setSelectedJdId(null);
      setReportState(null);
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

  async function runAnalysis() {
    if (!selectedResume || !selectedJdId) return;
    const nextReport = await jdService.buildReport(selectedResume, selectedJdId);
    if (!nextReport) return;
    setReportState(nextReport);
    if (isMobile) {
      setMobileView('workspace');
      setSheetOpen(true);
    }
  }

  async function renameJd(id: string) {
    const jd = await jdService.getById(id);
    if (!jd) return;
    const nextName = window.prompt('Edit JD name', jd.title);
    if (!nextName || !nextName.trim()) return;
    setJds(await jdService.rename(id, nextName.trim()));
  }

  async function downloadJd(id: string) {
    const jd = await jdService.getById(id);
    if (!jd) return;
    downloadTextFile(`${jd.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_jd.txt`, jd.parsedText);
  }

  async function deleteJd(id: string) {
    const next = await jdService.remove(id);
    setJds(next);

    if (reportState?.jd.id === id) {
      setReportState(null);
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
            setReportState(null);
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
              setReportState(null);
              setSheetOpen(false);
            }} />

            <div className="jd-result-col">
              <div id="jd-results">
                <JdResultPane report={reportState} selected={Boolean(selectedJd)} />
              </div>
              <div className={`jd-mobile-report-content${mobileView === 'report' ? '' : ' hidden'}`}>
                <JdResultPane
                  report={reportState}
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
        report={reportState}
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
