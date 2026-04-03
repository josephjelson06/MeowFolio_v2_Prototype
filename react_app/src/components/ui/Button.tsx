import type { ButtonHTMLAttributes, AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { cn } from 'lib/cn';

type Variant = 'primary' | 'secondary' | 'link';

interface BaseProps {
  variant?: Variant;
  className?: string;
}

type ButtonProps =
  | (PropsWithChildren<BaseProps & { to: string }> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'>)
  | (PropsWithChildren<BaseProps & { href: string }> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>)
  | (PropsWithChildren<BaseProps & ButtonHTMLAttributes<HTMLButtonElement>>);

function getButtonClass(variant: Variant, className?: string) {
  const base = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-charcoal px-4 py-2 text-center font-headline text-[11px] font-bold tracking-[0.01em] transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40';
  const interactive = 'shadow-tactile-sm hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none';
  const variants = {
    primary: 'bg-white/95 text-on-surface hover:bg-surface-container-low hover:text-primary hover:shadow-tactile',
    secondary: 'bg-white/85 font-sans text-[10px] font-semibold text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile',
    link: 'min-h-8 bg-white/80 px-3 py-1.5 font-sans text-[10px] font-semibold text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile-sm',
  } satisfies Record<Variant, string>;
  return cn(base, interactive, variants[variant], className);
}

export function Button(props: ButtonProps) {
  const variant = props.variant ?? 'primary';
  const className = getButtonClass(variant, props.className);

  if ('to' in props) {
    const { to, children, ...rest } = props;
    return (
      <Link className={className} to={to} {...rest}>
        {children}
      </Link>
    );
  }

  if ('href' in props) {
    const { href, children, ...rest } = props;
    return (
      <a className={className} href={href} {...rest}>
        {children}
      </a>
    );
  }

  const buttonProps = props as PropsWithChildren<BaseProps & ButtonHTMLAttributes<HTMLButtonElement>>;
  const { children, type = 'button', ...rest } = buttonProps;
  return (
    <button className={className} type={type} {...rest}>
      {children}
    </button>
  );
}
