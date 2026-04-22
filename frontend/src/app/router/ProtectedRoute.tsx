import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from 'state/session/sessionContext';
import { routes } from 'app/router/routes';

/**
 * Wraps protected workspace routes.
 *
 * - While the session is still loading (`!ready`) → render nothing (the
 *   SessionProvider already returns null, but this is a safety belt).
 * - If the user is not authenticated → redirect to home, preserving the
 *   attempted URL in `state.from` so we can send them back after login.
 * - If authenticated → render the child route via <Outlet />.
 */
export function ProtectedRoute() {
  const { actor, ready } = useSession();
  const location = useLocation();

  // Session is still being resolved – render nothing to avoid a flash.
  if (!ready) return null;

  if (!actor) {
    return (
      <Navigate
        to={routes.home}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
