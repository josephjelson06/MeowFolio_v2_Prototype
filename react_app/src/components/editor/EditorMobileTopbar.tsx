import { NavLink } from 'react-router-dom';
import { routes } from 'lib/routes';
import { useSession } from 'state/session/sessionContext';

interface EditorMobileTopbarProps {
  title: string;
  onAnalyze: () => void;
}

export function EditorMobileTopbar({ title, onAnalyze }: EditorMobileTopbarProps) {
  const { initials } = useSession();

  return (
    <div className="mb-4 flex items-center gap-3 rounded-[1.4rem] border-[1.5px] border-charcoal/75 bg-white/90 px-4 py-3 shadow-tactile md:hidden">
      <NavLink className="grid size-10 place-items-center rounded-full border border-outline bg-white text-xl text-on-surface" to={routes.resumes}>
        ←
      </NavLink>
      <span className="min-w-0 flex-1 truncate font-headline text-lg font-extrabold text-on-surface">{title}</span>
      <button
        className="inline-flex min-h-9 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-3 py-1.5 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
        type="button"
        onClick={onAnalyze}
      >
        Analyze
      </button>
      <NavLink className="grid size-10 place-items-center rounded-full border border-outline bg-surface text-sm font-semibold text-secondary" to={routes.profile}>
        {initials}
      </NavLink>
    </div>
  );
}
