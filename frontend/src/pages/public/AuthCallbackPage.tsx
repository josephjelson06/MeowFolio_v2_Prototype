import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from 'app/router/routes';

/**
 * Handles the OAuth redirect from Supabase/Google.
 * Supabase automatically exchanges the code for a session via the hash fragment.
 * We just need to wait briefly, then navigate to the dashboard.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase's JS SDK picks up the auth tokens from the URL hash automatically.
    // The onAuthStateChange listener in SessionContext will detect the new session.
    // We give it a small delay to ensure the session is processed, then redirect.
    const timer = setTimeout(() => {
      navigate(routes.dashboard, { replace: true });
    }, 150);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="text-center">
        <div className="text-lg font-bold text-on-surface">Signing you in...</div>
        <div className="mt-2 text-sm text-[color:var(--txt2)]">Redirecting to your workspace.</div>
      </div>
    </div>
  );
}
