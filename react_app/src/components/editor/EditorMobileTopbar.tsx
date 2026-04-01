import { NavLink } from 'react-router-dom';
import { routes } from 'lib/routes';

interface EditorMobileTopbarProps {
  title: string;
  onAnalyze: () => void;
}

export function EditorMobileTopbar({ title, onAnalyze }: EditorMobileTopbarProps) {
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
        AK
      </NavLink>
    </div>
  );
}
