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
    <section className="flex min-h-[calc(100vh-13rem)] items-center justify-center px-4 py-16 sm:px-6 lg:py-20">
      {/* content wrapper (NOT a card by default) */}
      <div className="relative w-full max-w-[36rem] text-center">

        {/* glow */}
        <div className={`absolute inset-x-10 top-10 h-36 rounded-full blur-3xl ${glowClass}`} />

        {/* content */}
        <div className="relative z-10 grid justify-items-center gap-7 sm:gap-8">

          {/* icon circle (this is the “visual anchor”) */}
          <div className={`grid size-28 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(28,28,24,0.12)] sm:size-32 ${iconClass}`}>
            <span className="font-headline text-7xl font-extrabold leading-none tracking-[-0.06em] sm:text-[5rem]">
              {code}
            </span>
          </div>

          {/* badge */}
          <div className={`inline-flex rounded-full border px-4 py-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.16em] ${badgeClass}`}>
            {label}
          </div>

          {/* title */}
          <h1 className="max-w-[22rem] font-headline text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-on-surface sm:text-[3.25rem]">
            {title}
          </h1>

          {/* description */}
          <p className={`max-w-[26rem] ${publicBodyClass}`}>
            {description}
          </p>

          {/* actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {actions.map(action => (
              <Button
                key={action.label}
                to={action.to}
                variant={action.variant ?? 'primary'}
                size="lg"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* OPTIONAL surface (subtle, not dominant) */}
        <div className={`pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-white/60 ${publicCardShell}`} />

      </div>
    </section>
  );
}