import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from 'lib/cn';
import { routes } from 'lib/routes';
import { leftTabs } from 'pages/workspace/editor/types';

const mobileTabClass =
  'flex-1 rounded-full border-2 border-charcoal/70 px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.12em] transition';

export function EditorWorkspaceLayout({
  resumeName,
  mobileView,
  activeLeftTab,
  setActiveLeftTab,
  setMobileView,
  onDownload,
  downloadLoading,
  statusText,
  mobileTopBar,
  leftWorkspace,
  previewPanel,
}: {
  resumeName: string;
  mobileView: 'edit' | 'preview';
  activeLeftTab: (typeof leftTabs)[number]['id'];
  setActiveLeftTab: (tab: (typeof leftTabs)[number]['id']) => void;
  setMobileView: (view: 'edit' | 'preview') => void;
  onDownload?: () => void;
  downloadLoading?: boolean;
  statusText: string;
  mobileTopBar: ReactNode;
  leftWorkspace: ReactNode;
  previewPanel: ReactNode;
}) {
  return (
    <div className="grid gap-4">
      {mobileTopBar}

      <div className="flex gap-2 md:hidden">
        {(['edit', 'preview'] as const).map(tab => (
          <button
            key={tab}
            className={cn(
              mobileTabClass,
              mobileView === tab ? 'bg-white text-on-surface shadow-tactile-sm' : 'bg-white/65 text-[color:var(--txt1)]',
            )}
            type="button"
            onClick={() => setMobileView(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="hidden items-center justify-between gap-4 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 px-5 py-4 shadow-tactile md:flex">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-[color:var(--txt1)]">
          <NavLink className="font-semibold text-primary transition hover:text-on-surface" to={routes.resumes}>
            Resumes
          </NavLink>
          <span>/</span>
          <span className="truncate text-on-surface font-semibold">{resumeName}</span>
        </div>
      </div>

      <div className="grid rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/88 shadow-tactile xl:h-[calc(100vh-15.5rem)] xl:grid-rows-[auto_minmax(0,1fr)] xl:overflow-hidden">
        <div className="hidden items-center justify-between gap-4 border-b border-charcoal/14 px-4 py-4 md:flex lg:px-5">
          <div className="flex flex-wrap items-center gap-2">
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

          <div className="flex min-w-0 items-center justify-end gap-4">
            <div className="hidden min-w-0 items-center gap-3 text-sm text-[color:var(--txt1)] lg:flex">
              <span className="size-2.5 shrink-0 rounded-full bg-tertiary"></span>
              <span className="truncate">{statusText}</span>
            </div>
            {onDownload && (
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-primary/60 bg-primary-fixed/40 px-4 py-2 font-headline text-[11px] font-bold text-primary shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-primary-fixed disabled:pointer-events-none disabled:opacity-40"
                type="button"
                onClick={onDownload}
                disabled={downloadLoading}
              >
                {downloadLoading ? 'Building PDF...' : '↓ Download PDF'}
              </button>
            )}
          </div>
        </div>

        <div className="grid min-h-0 gap-4 p-4 xl:grid-cols-2 xl:items-stretch xl:p-4">
          <div className={cn(mobileView === 'edit' ? 'grid min-h-0 gap-4' : 'hidden min-h-0 gap-4 md:grid')}>
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

            <div className="grid min-h-0 overflow-hidden rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/70 shadow-tactile-sm xl:h-full">
              {leftWorkspace}
            </div>
          </div>

          <div className={cn(mobileView === 'edit' ? 'hidden min-h-0 gap-4 md:grid' : 'grid min-h-0 gap-4')}>{previewPanel}</div>
        </div>
      </div>
    </div>
  );
}
