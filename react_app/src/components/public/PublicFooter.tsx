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
    <footer className="mt-6 flex flex-col gap-4 rounded-[1.75rem] border border-charcoal/15 bg-charcoal px-5 py-5 text-sm text-white/90 shadow-tactile md:flex-row md:items-center md:justify-between md:px-6">
      <span className="font-medium">&copy; 2026 meowfolio</span>
      <div className="flex flex-wrap gap-4 text-sm text-white/80">
        {footerLinks
          .filter(link => link.to !== location.pathname)
          .map(link => <Link className="transition hover:text-white" key={link.to} to={link.to}>{link.label}</Link>)}
      </div>
    </footer>
  );
}
