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
    <div className="mob-topbar editor-mobile-nav">
      <NavLink className="mob-back editor-back-link" to={routes.resumes}>
        &larr;
      </NavLink>
      <span className="mob-topbar-title">{title}</span>
      <button className="mob-analyze-btn" type="button" onClick={onAnalyze}>
        Analyze
      </button>
      <NavLink className="avatar" to={routes.profile}>
        {initials}
      </NavLink>
    </div>
  );
}
