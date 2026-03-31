import { NavLink } from 'react-router-dom';
import { Button } from 'components/ui/Button';
import { routes } from 'lib/routes';
import { useAuthModal } from 'hooks/useAuthModal';

export function PublicHeader() {
  const { openAuth } = useAuthModal();

  return (
    <>
      <nav className="gnav pub-desktop-nav">
        <NavLink className="gnav-logo" to={routes.home}>resumeai</NavLink>
        <div className="gnav-links">
          <NavLink className={({ isActive }) => `gnav-link${isActive ? ' active' : ''}`} to={routes.home}>Home</NavLink>
          <NavLink className={({ isActive }) => `gnav-link${isActive ? ' active' : ''}`} to={routes.about}>About</NavLink>
        </div>
        <div className="gnav-right">
          <Button onClick={() => openAuth()}>Login / Signup</Button>
        </div>
      </nav>

      <div className="mob-topbar pub-mobile-nav">
        <NavLink className="mob-topbar-logo" to={routes.home}>resumeai</NavLink>
        <Button className="pub-mobile-login" variant="link" onClick={() => openAuth()}>Login</Button>
      </div>

      <div className="mob-edit-toggle pub-mobile-links">
        <NavLink className={({ isActive }) => `mob-et-btn${isActive ? ' active' : ''}`} to={routes.home}>Home</NavLink>
        <NavLink className={({ isActive }) => `mob-et-btn${isActive ? ' active' : ''}`} to={routes.about}>About</NavLink>
      </div>
    </>
  );
}
