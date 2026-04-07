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
    <section className="flex min-h-[calc(100vh-13rem)] flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12 lg:py-16">
      <article className={`relative w-full max-w-[36rem] overflow-hidden bg-white/92 px-8 py-12 text-center sm:px-12 sm:py-14 ${publicCardShell}`}>
        <div className={`absolute inset-x-10 top-10 h-36 rounded-full blur-3xl ${glowClass}`} />

        <div className="relative z-10 grid justify-items-center gap-6 sm:gap-7">
          <div className={`grid size-28 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(28,28,24,0.12)] sm:size-32 ${iconClass}`}>
            <span className="font-headline text-7xl font-extrabold leading-none tracking-[-0.06em] sm:text-[5rem]">
              {code}
            </span>
          </div>

          <div className={`inline-flex rounded-full border px-4 py-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.16em] ${badgeClass}`}>
            {label}
          </div>

          <h1 className="max-w-[22rem] font-headline text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-on-surface sm:text-[3.25rem]">
            {title}
          </h1>

          <p className={`max-w-[26rem] ${publicBodyClass}`}>
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {actions.map(action => (
              <Button key={action.label} to={action.to} variant={action.variant ?? 'primary'} size="lg">
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
