import { Button, type ButtonVariant } from 'components/ui/Button';
import { publicBodyClass, publicCardShell } from 'components/public/publicStyles';

interface PublicErrorAction {
  label: string;
  to: string;
  variant?: ButtonVariant;
}

interface PublicErrorStateProps {
  code: string;
  label: string;
  title: string;
  description: string;
  glowClass: string;
  iconClass: string;
  badgeClass: string;
  actions: PublicErrorAction[];
}

export function PublicErrorState({
  code,
  label,
  title,
  description,
  glowClass,
  iconClass,
  badgeClass,
  actions,
}: PublicErrorStateProps) {
  return (
    <section className="flex flex-1 items-center justify-center py-8 sm:py-12 lg:py-16">
      <article className={`relative w-full max-w-[32rem] overflow-hidden bg-white/90 px-8 py-10 text-center sm:px-10 sm:py-12 ${publicCardShell}`}>
        <div className={`absolute inset-x-8 top-8 h-32 rounded-full blur-3xl ${glowClass}`} />

        <div className="relative z-10 grid justify-items-center gap-5 sm:gap-6">
          <div className={`grid size-24 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(28,28,24,0.12)] sm:size-28 ${iconClass}`}>
            <span className="font-headline text-6xl font-extrabold leading-none tracking-[-0.06em] sm:text-7xl">
              {code}
            </span>
          </div>

          <div className={`inline-flex rounded-full border px-4 py-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.16em] ${badgeClass}`}>
            {label}
          </div>

          <h1 className="max-w-[16rem] font-headline text-3xl font-extrabold leading-tight tracking-[-0.04em] text-on-surface sm:max-w-[18rem] sm:text-[2.5rem]">
            {title}
          </h1>

          <p className={`max-w-[24rem] ${publicBodyClass}`}>
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {actions.map(action => (
              <Button key={action.label} to={action.to} variant={action.variant ?? 'primary'} size="md">
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
