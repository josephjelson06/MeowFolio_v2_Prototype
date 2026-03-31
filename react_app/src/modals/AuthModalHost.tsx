import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from 'hooks/useAuthModal';
import { routes } from 'lib/routes';
import { Badge } from 'components/ui/Badge';

export function AuthModalHost() {
  const navigate = useNavigate();
  const { authOpen, authConfig, closeAuth } = useAuthModal();

  useEffect(() => {
    if (!authOpen) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeAuth();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [authOpen, closeAuth]);

  if (!authOpen) return null;

  return (
    <div className="auth-modal-overlay open" aria-hidden="false" onClick={event => {
      if (event.target === event.currentTarget) closeAuth();
    }}>
      <div className="auth-modal-box" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button className="auth-close" type="button" onClick={closeAuth}>&times;</button>
        <div className="section-label auth-section-label">SIGN IN / SIGN UP</div>
        <div className="auth-title" id="auth-modal-title">{authConfig.title}</div>
        <div className="auth-copy">{authConfig.copy}</div>
        <div className="auth-highlights">
          <Badge variant="accent">{authConfig.accent}</Badge>
          <Badge variant="info">{authConfig.info}</Badge>
          <Badge>{authConfig.outline}</Badge>
        </div>
        <div className="auth-preview">
          <div className="pub-card-title">{authConfig.previewTitle}</div>
          <div className="pub-card-copy">{authConfig.previewCopy}</div>
        </div>
        <button className="auth-google-btn" type="button" onClick={() => {
          closeAuth();
          navigate(routes.dashboard);
        }}>
          <span>G</span>
          <span>Continue with Google</span>
        </button>
        <div className="auth-note">{authConfig.note}</div>
      </div>
    </div>
  );
}
