import { useEffect, useState } from 'react';
import { ModalShell } from 'components/ui/ModalShell';
import { resumeService } from 'services/resumeService';
import { useUiContext } from 'state/ui/uiContext';

export function ResumeDeleteModalHost() {
  const { resumeDeleteTarget, closeResumeDelete } = useUiContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!resumeDeleteTarget) {
      setBusy(false);
      setError('');
    }
  }, [resumeDeleteTarget]);

  useEffect(() => {
    if (!resumeDeleteTarget) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeResumeDelete();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeResumeDelete, resumeDeleteTarget]);

  if (!resumeDeleteTarget) return null;

  return (
    <ModalShell
      labelledBy="resume-delete-modal-title"
      onClose={closeResumeDelete}
      overlayClassName="bg-charcoal/30 backdrop-blur-sm"
      panelClassName="max-w-[28rem] border-[1.5px] border-charcoal/80 bg-[rgba(255,253,249,0.98)] p-6 shadow-tactile-lg shadow-ambient"
    >
      <button
        className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border-[1.5px] border-charcoal/70 bg-white/85 text-sm text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-surface-container-low hover:text-on-surface"
        type="button"
        onClick={closeResumeDelete}
      >
        &times;
      </button>

      <div className="font-headline text-xl font-extrabold text-on-surface" id="resume-delete-modal-title">
        Delete resume
      </div>
      <div className="mt-2 text-sm leading-7 text-[color:var(--txt2)]">
        Delete <strong className="text-on-surface">{resumeDeleteTarget.name}</strong> from your resume library. This
        action cannot be undone in the current prototype.
      </div>

      {error ? <div className="mt-4 text-sm text-error">{error}</div> : null}

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/65 bg-white/85 px-4 py-2 font-headline text-[11px] font-bold text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-white hover:text-on-surface"
          type="button"
          onClick={closeResumeDelete}
          disabled={busy}
        >
          Cancel
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-error/40 bg-error-container/70 px-4 py-2 font-headline text-[11px] font-bold text-error shadow-tactile-sm transition hover:bg-error-container disabled:pointer-events-none disabled:opacity-40"
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError('');
            try {
              await resumeService.remove(resumeDeleteTarget.id);
              closeResumeDelete();
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Could not delete resume.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'Deleting...' : 'Delete resume'}
        </button>
      </div>
    </ModalShell>
  );
}
