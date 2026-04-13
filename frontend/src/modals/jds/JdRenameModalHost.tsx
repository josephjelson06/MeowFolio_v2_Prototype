import { useEffect, useState } from 'react';
import { ModalShell } from 'components/ui/ModalShell';
import { jdService } from 'services/jdService';
import { useUiContext } from 'state/ui/uiContext';

export function JdRenameModalHost() {
  const { jdRenameTarget, closeJdRename } = useUiContext();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jdRenameTarget) {
      setValue('');
      setBusy(false);
      setError('');
      return;
    }

    setValue(jdRenameTarget.title);
    setBusy(false);
    setError('');
  }, [jdRenameTarget]);

  useEffect(() => {
    if (!jdRenameTarget) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeJdRename();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeJdRename, jdRenameTarget]);

  if (!jdRenameTarget) return null;

  return (
    <ModalShell
      labelledBy="jd-rename-modal-title"
      onClose={closeJdRename}
      overlayClassName="bg-charcoal/30 backdrop-blur-sm"
      panelClassName="max-w-[28rem] border-[1.5px] border-charcoal/80 bg-[rgba(255,253,249,0.98)] p-6 shadow-tactile-lg shadow-ambient"
    >
      <button
        className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border-[1.5px] border-charcoal/70 bg-white/85 text-sm text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-surface-container-low hover:text-on-surface"
        type="button"
        onClick={closeJdRename}
      >
        &times;
      </button>

      <div className="font-headline text-xl font-extrabold text-on-surface" id="jd-rename-modal-title">
        Rename job description
      </div>
      <div className="mt-2 text-sm leading-7 text-[color:var(--txt2)]">
        Update the title shown in your saved JD list.
      </div>

      <label className="mt-5 grid gap-2">
        <span className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">JD title</span>
        <input
          className="min-h-12 rounded-2xl border border-outline-variant bg-white/90 px-4 py-3 text-sm text-[color:var(--txt1)]"
          value={value}
          onChange={event => setValue(event.target.value)}
          placeholder="Senior Frontend Engineer"
          autoFocus
        />
      </label>

      {error ? <div className="mt-3 text-sm text-error">{error}</div> : null}

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/65 bg-white/85 px-4 py-2 font-headline text-[11px] font-bold text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-white hover:text-on-surface"
          type="button"
          onClick={closeJdRename}
          disabled={busy}
        >
          Cancel
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal bg-white/95 px-4 py-2 font-headline text-[11px] font-bold text-on-surface shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-surface-container-low hover:text-primary disabled:pointer-events-none disabled:opacity-40"
          type="button"
          disabled={busy || !value.trim() || value.trim() === jdRenameTarget.title}
          onClick={async () => {
            const nextName = value.trim();
            if (!nextName) return;
            setBusy(true);
            setError('');
            try {
              await jdService.rename(jdRenameTarget.id, nextName);
              closeJdRename();
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Could not rename JD.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'Saving...' : 'Save title'}
        </button>
      </div>
    </ModalShell>
  );
}
