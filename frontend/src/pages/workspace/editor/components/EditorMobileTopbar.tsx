import { NavLink } from 'react-router-dom';
import { routes } from 'lib/routes';
import { useSession } from 'state/session/sessionContext';

export function EditorMobileTopbar({
  title,
  onDownload,
  downloadLoading,
}: {
  title: string;
  onDownload?: () => void;
  downloadLoading?: boolean;
}) {
  const { initials } = useSession();

  return (
    <div className="mb-4 flex items-center gap-3 rounded-[1.4rem] border-[1.5px] border-charcoal/75 bg-white/90 px-4 py-3 shadow-tactile md:hidden">
      <NavLink className="grid size-10 place-items-center rounded-full border border-outline bg-white text-xl text-on-surface" to={routes.resumes}>
        &larr;
      </NavLink>
      <span className="min-w-0 flex-1 truncate font-headline text-lg font-extrabold text-on-surface">{title}</span>
      
      {onDownload && (
        <button
          className="grid size-10 place-items-center rounded-full border-2 border-charcoal bg-primary text-white shadow-tactile-sm transition active:translate-x-px active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-40"
          type="button"
          onClick={onDownload}
          disabled={downloadLoading}
          title="Download PDF"
        >
          {downloadLoading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <span className="text-base font-bold">↓</span>
          )}
        </button>
      )}

      <NavLink className="grid size-10 place-items-center rounded-full border border-outline bg-surface text-sm font-semibold text-secondary" to={routes.profile}>
        {initials}
      </NavLink>
    </div>
  );
}
