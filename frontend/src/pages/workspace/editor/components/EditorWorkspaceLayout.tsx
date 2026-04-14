import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from 'lib/cn';
import { routes } from 'lib/routes';
import { leftTabs } from 'pages/workspace/editor/types';

const mobileTabClass =
  'flex-1 rounded-full border-2 border-charcoal/70 px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.12em] transition';
const desktopModeClass =
  'inline-flex min-h-10 items-center justify-center rounded-full border-2 px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.12em] transition';

export function EditorWorkspaceLayout({
  resumeName,
  mode,
  mobileView,
  activeLeftTab,
  setActiveLeftTab,
  setMobileView,
  onShowEditor,
  onShowAts,
  mobileTopBar,
  leftWorkspace,
  previewPanel,
  atsReportView,
  mobileSheet,
}: {
  resumeName: string;
  mode: 'editor' | 'ats';
  mobileView: 'edit' | 'preview' | 'ats';
  activeLeftTab: (typeof leftTabs)[number]['id'];
  setActiveLeftTab: (tab: (typeof leftTabs)[number]['id']) => void;
  setMobileView: (view: 'edit' | 'preview' | 'ats') => void;
  onShowEditor: () => void;
  onShowAts: () => void;
  mobileTopBar: ReactNode;
  leftWorkspace: ReactNode;
  previewPanel: ReactNode;
  atsReportView: ReactNode;
  mobileSheet: ReactNode;
}) {
  return (
    <div className="grid gap-4">
      {mobileTopBar}

      <div className="flex gap-2 md:hidden">
        {(['edit', 'preview', 'ats'] as const).map(tab => (
          <button
            key={tab}
            className={cn(
              mobileTabClass,
              mobileView === tab ? 'bg-white text-on-surface shadow-tactile-sm' : 'bg-white/65 text-[color:var(--txt1)]',
            )}
            type="button"
            onClick={() => setMobileView(tab)}
          >
            {tab === 'ats' ? 'ATS' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="hidden items-center justify-between gap-4 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 px-5 py-4 shadow-tactile md:flex">
        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-[color:var(--txt1)]">
            <NavLink className="font-semibold text-primary transition hover:text-on-surface" to={routes.resumes}>
              Resumes
            </NavLink>
            <span>/</span>
            <span className="truncate">{resumeName}</span>
            <span>/</span>
            <span className="font-semibold text-on-surface">{mode === 'ats' ? 'ATS Score' : 'Editor'}</span>
          </div>

          {mode === 'editor' ? (
            <div className="flex items-center justify-self-center gap-2">
              {leftTabs.map(tab => (
                <button
                  key={tab.id}
                  className={cn(
                    'inline-flex min-h-10 items-center justify-center rounded-full border-2 px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.12em] transition',
                    activeLeftTab === tab.id
                      ? 'border-charcoal/75 bg-white text-on-surface shadow-tactile-sm'
                      : 'border-outline bg-white/65 text-[color:var(--txt1)] hover:bg-white',
                  )}
                  type="button"
                  onClick={() => setActiveLeftTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          <div className="flex shrink-0 justify-self-end gap-2">
            <button
              className={cn(
                desktopModeClass,
                mode === 'editor' ? 'border-charcoal/75 bg-white text-on-surface shadow-tactile-sm' : 'border-outline bg-white/65 text-[color:var(--txt1)]',
              )}
              type="button"
              onClick={onShowEditor}
            >
              Editor
            </button>
            <button
              className={cn(
                desktopModeClass,
                mode === 'ats' ? 'border-charcoal/75 bg-white text-on-surface shadow-tactile-sm' : 'border-outline bg-white/65 text-[color:var(--txt1)]',
              )}
              type="button"
              onClick={onShowAts}
            >
              ATS Score
            </button>
          </div>
        </div>
      </div>

      {mode === 'editor' ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
          <div className={cn(mobileView === 'edit' ? 'grid gap-4' : 'hidden gap-4 md:grid')}>
            <div className="flex flex-wrap gap-2 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-3 shadow-tactile-sm md:hidden">
              {leftTabs.map(tab => (
                <button
                  key={tab.id}
                  className={cn(
                    'inline-flex min-h-10 items-center justify-center rounded-full border-2 px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.12em] transition',
                    activeLeftTab === tab.id
                      ? 'border-charcoal/75 bg-white text-on-surface shadow-tactile-sm'
                      : 'border-outline bg-white/65 text-[color:var(--txt1)] hover:bg-white',
                  )}
                  type="button"
                  onClick={() => setActiveLeftTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/88 p-4 shadow-tactile xl:min-h-full xl:p-0">
              {leftWorkspace}
            </div>
          </div>

          <div className={cn(mobileView === 'edit' ? 'hidden gap-4 md:grid' : 'grid gap-4')}>{previewPanel}</div>
        </div>
      ) : (
        atsReportView
      )}

      {mobileSheet}
    </div>
  );
}
