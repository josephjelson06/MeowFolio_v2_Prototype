import { Link, useLocation } from 'react-router-dom';
import { routes } from 'lib/routes';

const footerLinks = [
  { to: routes.home, label: 'Home' },
  { to: routes.about, label: 'About' },
  { to: routes.notFound, label: '404' },
  { to: routes.error500, label: '500' },
];

export function PublicFooter() {
  const location = useLocation();

  return (
    <footer className="pub-footer-row">
      <span>&copy; 2026 meowfolio</span>
      <div className="pub-footer-links">
        {footerLinks
          .filter(link => link.to !== location.pathname)
          .map(link => <Link key={link.to} to={link.to}>{link.label}</Link>)}
      </div>
    </footer>
  );
}
