import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from 'app/router/routes';
import { ModalShell } from 'components/ui/ModalShell';
import { useUiContext } from 'state/ui/uiContext';

export function LogoutConfirmModalHost() {
  const navigate = useNavigate();
  const { logoutOpen, closeLogout } = useUiContext();

  useEffect(() => {
    if (!logoutOpen) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeLogout();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeLogout, logoutOpen]);

  if (!logoutOpen) return null;

  return (
    <ModalShell
      labelledBy="logout-modal-title"
      onClose={closeLogout}
      overlayClassName="bg-charcoal/30 backdrop-blur-sm"
      panelClassName="max-w-[26rem] border-[1.5px] border-charcoal/80 bg-[rgba(255,253,249,0.98)] p-6 shadow-tactile-lg shadow-ambient"
    >
      <button
        className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border-[1.5px] border-charcoal/70 bg-white/85 text-sm text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-surface-container-low hover:text-on-surface"
        type="button"
        onClick={closeLogout}
      >
        &times;
      </button>

      <div className="font-headline text-xl font-extrabold text-on-surface" id="logout-modal-title">
        Logout
      </div>
      <div className="mt-2 text-sm leading-7 text-[color:var(--txt2)]">
        Leave the workspace and return to the public site.
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/65 bg-white/85 px-4 py-2 font-headline text-[11px] font-bold text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-white hover:text-on-surface"
          type="button"
          onClick={closeLogout}
        >
          Stay here
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal bg-white/95 px-4 py-2 font-headline text-[11px] font-bold text-on-surface shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-surface-container-low hover:text-primary"
          type="button"
          onClick={() => {
            closeLogout();
            navigate(routes.home);
          }}
        >
          Logout
        </button>
      </div>
    </ModalShell>
  );
}
