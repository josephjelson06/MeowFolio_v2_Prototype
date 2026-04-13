import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from 'lib/routes';
import { cn } from 'lib/cn';
import { useUiContext } from 'state/ui/uiContext';
import type { AuthModalConfig } from 'types/ui';

type AuthModalChipVariant = 'accent' | 'info' | 'outline';

function AuthModalChip({
  children,
  className,
  variant = 'outline',
}: {
  children: string;
  className?: string;
  variant?: AuthModalChipVariant;
}) {
  const toneClass =
    variant === 'accent'
      ? 'border-primary/40 bg-primary-fixed text-primary'
      : variant === 'info'
        ? 'border-secondary/35 bg-secondary-fixed text-secondary'
        : 'border-charcoal/65 bg-white/80 text-[color:var(--txt2)]';

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border-[1.5px] px-4 py-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.14em] sm:text-xs',
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}

function AuthModalPanel({
  authConfig,
  onClose,
  onContinue,
}: {
  authConfig: AuthModalConfig;
  onClose: () => void;
  onContinue: () => void;
}) {
  const copy =
    authConfig.copy ??
    'Use one quick sign-in to move from the public story into the working meowfolio prototype.';

  return (
    <div
      className="relative w-full max-w-[36rem] overflow-hidden rounded-[1.75rem] border-[1.5px] border-charcoal/80 bg-[rgba(255,252,247,0.985)] p-5 shadow-ambient shadow-tactile-lg sm:p-7"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="pointer-events-none absolute left-6 top-2 h-24 w-24 rounded-full bg-primary-fixed/85 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-6 h-24 w-24 rounded-full bg-secondary-fixed/70 blur-3xl" />

      <button
        className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border-[1.5px] border-charcoal/70 bg-white/90 text-sm text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-surface-container-low hover:text-on-surface sm:right-5 sm:top-5"
        type="button"
        onClick={onClose}
        aria-label="Close auth modal"
      >
        &times;
      </button>

      <div className="relative grid gap-5">
        <div className="grid gap-2">
          <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            SIGN IN / SIGN UP
          </div>
          <div
            className="max-w-[15ch] font-headline text-3xl font-extrabold leading-[0.96] tracking-[-0.04em] text-on-surface"
            id="auth-modal-title"
          >
            {authConfig.title}
          </div>
          <div className="max-w-[30rem] text-sm leading-7 text-[color:var(--txt2)] sm:text-base">{copy}</div>
        </div>

        {authConfig.accent || authConfig.info || authConfig.outline ? (
          <div className="flex flex-wrap gap-2">
            {authConfig.accent ? <AuthModalChip variant="accent">{authConfig.accent}</AuthModalChip> : null}
            {authConfig.info ? <AuthModalChip variant="info">{authConfig.info}</AuthModalChip> : null}
            {authConfig.outline ? <AuthModalChip>{authConfig.outline}</AuthModalChip> : null}
          </div>
        ) : null}

        {authConfig.previewTitle || authConfig.previewCopy ? (
          <div className="rounded-[1.4rem] border border-outline-variant/60 bg-white/82 p-4 sm:p-5">
            {authConfig.previewTitle ? (
              <div className="font-headline text-lg font-extrabold text-on-surface">{authConfig.previewTitle}</div>
            ) : null}
            {authConfig.previewCopy ? (
              <div className="mt-1 text-sm leading-7 text-[color:var(--txt2)]">{authConfig.previewCopy}</div>
            ) : null}
          </div>
        ) : null}

        <button
          className="group inline-flex min-h-[3.75rem] w-full items-center justify-between gap-4 rounded-[1.35rem] border-[1.5px] border-charcoal bg-white/96 px-4 py-3 text-left font-headline text-sm font-bold text-on-surface shadow-tactile-sm transition hover:-translate-y-0.5 hover:bg-surface-container-low hover:text-primary hover:shadow-tactile active:translate-y-px active:shadow-none sm:px-5"
          type="button"
          onClick={onContinue}
        >
          <span className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border border-outline-variant bg-surface-container-low font-headline text-base">
              G
            </span>
            <span className="text-base">Continue with Google</span>
          </span>
          <span className="text-lg transition group-hover:translate-x-0.5">{'\u2192'}</span>
        </button>

        <div className="text-xs leading-6 text-[color:var(--txt2)]">
          {authConfig.note ?? 'This prototype uses a single Google sign-in path so you can jump straight into the workspace.'}
        </div>
      </div>
    </div>
  );
}

export function AuthModalHost() {
  const navigate = useNavigate();
  const { authOpen, authConfig, closeAuth } = useUiContext();

  useEffect(() => {
    if (!authOpen) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeAuth();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [authOpen, closeAuth]);

  if (!authOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-charcoal/40 px-4 py-6 backdrop-blur-md sm:px-6"
      aria-hidden="false"
      onClick={event => {
        if (event.target === event.currentTarget) closeAuth();
      }}
    >
      <AuthModalPanel
        authConfig={authConfig}
        onClose={closeAuth}
        onContinue={() => {
          closeAuth();
          navigate(routes.dashboard);
        }}
      />
    </div>
  );
}
