import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from 'hooks/useAuthModal';
import { routes } from 'lib/routes';
import { Badge } from 'components/ui/Badge';

export function AuthModalHost() {
  const navigate = useNavigate();
  const { authOpen, authConfig, closeAuth } = useAuthModal();

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
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-charcoal/30 px-4 backdrop-blur-sm" aria-hidden="false" onClick={event => {
      if (event.target === event.currentTarget) closeAuth();
    }}>
      <div className="relative w-full max-w-[34rem] overflow-y-auto rounded-[1.75rem] border-[1.5px] border-charcoal/80 bg-[rgba(255,253,249,0.98)] p-6 shadow-tactile-lg shadow-ambient" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border-[1.5px] border-charcoal/70 bg-white/85 text-sm text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-surface-container-low hover:text-on-surface" type="button" onClick={closeAuth}>&times;</button>
        <div className="mb-2 font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-primary">SIGN IN / SIGN UP</div>
        <div className="font-headline text-2xl font-extrabold text-on-surface" id="auth-modal-title">{authConfig.title}</div>
        <div className="mt-2 text-sm leading-7 text-[color:var(--txt2)]">{authConfig.copy}</div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="accent">{authConfig.accent}</Badge>
          <Badge variant="info">{authConfig.info}</Badge>
          <Badge>{authConfig.outline}</Badge>
        </div>
        <div className="mt-5 rounded-[1.4rem] border border-outline-variant/60 bg-white/80 p-4">
          <div className="font-headline text-lg font-extrabold text-on-surface">{authConfig.previewTitle}</div>
          <div className="mt-1 text-sm leading-7 text-[color:var(--txt2)]">{authConfig.previewCopy}</div>
        </div>
        <button className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-full border-2 border-charcoal bg-white/95 px-4 py-2 font-headline text-sm font-bold text-on-surface shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-surface-container-low hover:text-primary hover:shadow-tactile active:translate-x-px active:translate-y-px active:shadow-none" type="button" onClick={() => {
          closeAuth();
          navigate(routes.dashboard);
        }}>
          <span className="grid size-7 place-items-center rounded-full border border-outline-variant bg-surface-container-low font-headline text-sm">G</span>
          <span>Continue with Google</span>
        </button>
        <div className="mt-3 text-xs text-[color:var(--txt2)]">{authConfig.note}</div>
      </div>
    </div>
  );
}
