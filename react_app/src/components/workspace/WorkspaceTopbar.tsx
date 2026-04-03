import { NavLink } from 'react-router-dom';
import { routes } from 'lib/routes';
import { useSession } from 'state/session/sessionContext';

interface WorkspaceTopbarProps {
  title: string;
  editorMode?: boolean;
}

export function WorkspaceTopbar({ title, editorMode = false }: WorkspaceTopbarProps) {
  const { initials } = useSession();
  if (editorMode) {
    return (
      <div className="sticky top-0 z-40 flex min-h-[56px] items-center gap-2 border-b border-charcoal/10 bg-background/92 px-4 backdrop-blur-xl md:hidden">
        <NavLink className="grid size-9 place-items-center rounded-full border border-charcoal/25 bg-white/80 text-lg text-[color:var(--txt1)]" to={routes.resumes}>&larr;</NavLink>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">{title}</span>
        <NavLink className="inline-flex min-h-9 items-center rounded-full border-2 border-charcoal/75 bg-white/90 px-3 py-1 text-[11px] font-bold text-on-surface shadow-tactile-sm" to={routes.jds}>Analyze</NavLink>
        <NavLink className="grid size-9 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 font-headline text-xs font-bold text-secondary shadow-tactile-sm" to={routes.profile}>{initials}</NavLink>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 flex min-h-[56px] items-center gap-3 border-b border-charcoal/10 bg-background/92 px-4 backdrop-blur-xl md:hidden">
      <NavLink className="inline-flex items-center font-headline text-lg font-extrabold tracking-[-0.03em] text-on-surface" to={routes.dashboard}>meowfolio</NavLink>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">{title}</span>
      <NavLink className="grid size-9 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 font-headline text-xs font-bold text-secondary shadow-tactile-sm" to={routes.profile}>{initials}</NavLink>
    </div>
  );
}
