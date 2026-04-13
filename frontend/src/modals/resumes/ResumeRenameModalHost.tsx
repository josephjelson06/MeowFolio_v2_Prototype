import { useEffect, useState } from 'react';
import { ModalShell } from 'components/ui/ModalShell';
import { resumeService } from 'services/resumeService';
import { useUiContext } from 'state/ui/uiContext';

export function ResumeRenameModalHost() {
  const { resumeRenameTarget, closeResumeRename } = useUiContext();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!resumeRenameTarget) {
      setValue('');
      setBusy(false);
      setError('');
      return;
    }

    setValue(resumeRenameTarget.name);
    setBusy(false);
    setError('');
  }, [resumeRenameTarget]);

  useEffect(() => {
    if (!resumeRenameTarget) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeResumeRename();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeResumeRename, resumeRenameTarget]);

  if (!resumeRenameTarget) return null;

  return (
    <ModalShell
      labelledBy="resume-rename-modal-title"
      onClose={closeResumeRename}
      overlayClassName="bg-charcoal/30 backdrop-blur-sm"
      panelClassName="max-w-[28rem] border-[1.5px] border-charcoal/80 bg-[rgba(255,253,249,0.98)] p-6 shadow-tactile-lg shadow-ambient"
    >
      <button
        className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border-[1.5px] border-charcoal/70 bg-white/85 text-sm text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-surface-container-low hover:text-on-surface"
        type="button"
        onClick={closeResumeRename}
      >
        &times;
      </button>

      <div className="font-headline text-xl font-extrabold text-on-surface" id="resume-rename-modal-title">
        Rename resume
      </div>
      <div className="mt-2 text-sm leading-7 text-[color:var(--txt2)]">
        Update the file name shown in your resume library.
      </div>

      <label className="mt-5 grid gap-2">
        <span className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Resume name</span>
        <input
          className="min-h-12 rounded-2xl border border-outline-variant bg-white/90 px-4 py-3 text-sm text-[color:var(--txt1)]"
          value={value}
          onChange={event => setValue(event.target.value)}
          placeholder="resume_v4.tex"
          autoFocus
        />
      </label>

      {error ? <div className="mt-3 text-sm text-error">{error}</div> : null}

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/65 bg-white/85 px-4 py-2 font-headline text-[11px] font-bold text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-white hover:text-on-surface"
          type="button"
          onClick={closeResumeRename}
          disabled={busy}
        >
          Cancel
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal bg-white/95 px-4 py-2 font-headline text-[11px] font-bold text-on-surface shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-surface-container-low hover:text-primary disabled:pointer-events-none disabled:opacity-40"
          type="button"
          disabled={busy || !value.trim() || value.trim() === resumeRenameTarget.name}
          onClick={async () => {
            const nextName = value.trim();
            if (!nextName) return;
            setBusy(true);
            setError('');
            try {
              await resumeService.rename(resumeRenameTarget.id, nextName);
              closeResumeRename();
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Could not rename resume.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? 'Saving...' : 'Save name'}
        </button>
      </div>
    </ModalShell>
  );
}
