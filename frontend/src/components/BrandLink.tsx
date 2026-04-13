import { NavLink } from 'react-router-dom';
import { routes } from 'app/router/routes';
import { cn } from 'lib/cn';

export function BrandLink({
  className,
  compact = false,
  to = routes.home,
}: {
  className?: string;
  compact?: boolean;
  to?: string;
}) {
  return (
    <NavLink className={cn('inline-flex w-max items-center gap-3', className)} to={to}>
      <div
        className={cn(
          'flex items-center justify-center rounded-xl border-2 border-charcoal bg-primary shadow-tactile-sm',
          compact ? 'h-9 w-9' : 'h-10 w-10',
        )}
      >
        <span
          className={cn('material-symbols-outlined text-on-primary', compact ? 'text-[20px]' : 'text-[22px]')}
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          pets
        </span>
      </div>
      <span className={cn('font-headline font-extrabold tracking-tight text-on-surface', compact ? 'text-lg' : 'text-xl')}>
        MeowFolio
      </span>
    </NavLink>
  );
}
