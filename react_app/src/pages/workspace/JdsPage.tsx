import { useEffect, useMemo, useState } from 'react';
import { JdListPane } from 'components/jds/JdListPane';
import { JdMobileSheet } from 'components/jds/JdMobileSheet';
import { JdResultPane } from 'components/jds/JdResultPane';
import { ResumePickerPane } from 'components/jds/ResumePickerPane';
import { useJdModal } from 'hooks/useJdModal';
import { useViewportMode } from 'hooks/useViewportMode';
import { cn } from 'lib/cn';
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

const mobileTabClass =
  'flex-1 rounded-full border-2 border-charcoal/70 px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.12em] transition';

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
  const [analyzing, setAnalyzing] = useState(false);

  const pageItems = useMemo(() => {
    const start = (jdPage - 1) * JD_PAGE_SIZE;
    return jds.slice(start, start + JD_PAGE_SIZE);
  }, [jdPage, jds]);

  const totalPages = Math.max(1, Math.ceil(jds.length / JD_PAGE_SIZE));
  const selectedJd = useMemo(() => jds.find(item => item.id === selectedJdId) ?? null, [jds, selectedJdId]);

  useEffect(() => {
    async function syncLibraries(preferredJdId?: string | null) {
      const [nextJds, nextProfiles] = await Promise.all([jdService.list(), jdService.getMatchProfiles()]);
      setJds(nextJds);
      setResumeProfiles(nextProfiles);

      setSelectedJdId(current => {
        const candidate = preferredJdId ?? current;
        const nextSelected = candidate && nextJds.some(item => item.id === candidate) ? candidate : nextJds[0]?.id ?? null;
        setJdPage(getPageForId(nextJds, nextSelected));
        return nextSelected;
      });

      setSelectedResume(current => (current && nextProfiles.some(item => item.id === current) ? current : nextProfiles[0]?.id ?? null));
    }

    void syncLibraries();

    function handleJdChange(event: Event) {
      const customEvent = event as CustomEvent<{ id?: string }>;
      setReportState(null);
      setMobileView('workspace');
      setSheetOpen(false);
      void syncLibraries(customEvent.detail?.id ?? null);
    }

    function handleResumeChange() {
      void syncLibraries();
    }

    window.addEventListener(jdService.eventName, handleJdChange as EventListener);
    window.addEventListener(resumeService.eventName, handleResumeChange);
    return () => {
      window.removeEventListener(jdService.eventName, handleJdChange as EventListener);
      window.removeEventListener(resumeService.eventName, handleResumeChange);
    };
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
    try {
      setAnalyzing(true);
      const nextReport = await jdService.buildReport(selectedResume, selectedJdId);
      if (!nextReport) return;
      setReportState(nextReport);
      if (isMobile) {
        setMobileView('workspace');
        setSheetOpen(true);
      }
    } finally {
      setAnalyzing(false);
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
      <div className="mb-4 flex gap-2 md:hidden">
        <button
          className={cn(mobileTabClass, mobileView === 'workspace' ? 'bg-white text-on-surface shadow-tactile-sm' : 'bg-white/65 text-[color:var(--txt1)]')}
          type="button"
          onClick={() => setMobileView('workspace')}
        >
          Workspace
        </button>
        <button
          className={cn(mobileTabClass, mobileView === 'report' ? 'bg-white text-on-surface shadow-tactile-sm' : 'bg-white/65 text-[color:var(--txt1)]')}
          type="button"
          onClick={() => setMobileView('report')}
        >
          Detailed Report
        </button>
      </div>

      <main className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className={cn(mobileView === 'report' ? 'hidden md:block' : 'block')}>
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
        </div>

        <section className={cn(mobileView === 'report' ? 'hidden gap-5 md:grid' : 'grid gap-5')}>
          <div className="flex flex-col gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:flex-row md:items-start md:justify-between md:p-6">
            <div className="grid gap-2">
              <div className="font-headline text-2xl font-extrabold text-on-surface">{analyzeTitle}</div>
              <div className="max-w-2xl text-sm leading-7 text-[color:var(--txt2)]">{analyzeSubtitle}</div>
            </div>
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40"
              type="button"
              onClick={() => {
                void runAnalysis();
              }}
              disabled={!selectedResume || !selectedJd || analyzing}
            >
              {analyzing ? 'Running...' : 'Run Analysis →'}
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <ResumePickerPane
              items={resumeProfiles}
              activeKey={selectedResume}
              onSelect={key => {
                setSelectedResume(key);
                setReportState(null);
                setSheetOpen(false);
              }}
            />
            <JdResultPane report={reportState} selected={Boolean(selectedJd)} />
          </div>
        </section>

        <div className={cn(mobileView === 'report' ? 'grid md:hidden' : 'hidden')}>
          <JdResultPane
            report={reportState}
            selected={Boolean(selectedJd)}
            detailed
            onBackToWorkspace={() => setMobileView('workspace')}
          />
        </div>
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
