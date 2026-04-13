import { useEffect, useState } from 'react';
import { ModalShell } from 'components/ui/ModalShell';
import { jdService } from 'services/jdService';
import { useUiContext } from 'state/ui/uiContext';

export function JdDeleteModalHost() {
  const { jdDeleteTarget, closeJdDelete } = useUiContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jdDeleteTarget) {
      setBusy(false);
      setError('');
    }
  }, [jdDeleteTarget]);

  useEffect(() => {
    if (!jdDeleteTarget) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeJdDelete();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeJdDelete, jdDeleteTarget]);

  if (!jdDeleteTarget) return null;

  return (
    <ModalShell
      labelledBy="jd-delete-modal-title"
      onClose={closeJdDelete}
      overlayClassName="bg-charcoal/30 backdrop-blur-sm"
      panelClassName="max-w-[28rem] border-[1.5px] border-charcoal/80 bg-[rgba(255,253,249,0.98)] p-6 shadow-tactile-lg shadow-ambient"
    >
      <button
        className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border-[1.5px] border-charcoal/70 bg-white/85 text-sm text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-surface-container-low hover:text-on-surface"
        type="button"
        onClick={closeJdDelete}
      >
        &times;
      </button>

      <div className="font-headline text-xl font-extrabold text-on-surface" id="jd-delete-modal-title">
        Delete job description
      </div>
      <div className="mt-2 text-sm leading-7 text-[color:var(--txt2)]">
        Delete <strong className="text-on-surface">{jdDeleteTarget.title}</strong> from your saved JD list.
      </div>

      {error ? <div className="mt-4 text-sm text-error">{error}</div> : null}

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/65 bg-white/85 px-4 py-2 font-headline text-[11px] font-bold text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-white hover:text-on-surface"
          type="button"
          onClick={closeJdDelete}
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
              await jdService.remove(jdDeleteTarget.id);
              closeJdDelete();
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Could not delete JD.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'Deleting...' : 'Delete JD'}
        </button>
      </div>
    </ModalShell>
  );
}
