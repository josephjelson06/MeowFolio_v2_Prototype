import type { ButtonHTMLAttributes, AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { cn } from 'lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

type ButtonProps =
  | (PropsWithChildren<BaseProps & { to: string }> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'>)
  | (PropsWithChildren<BaseProps & { href: string }> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>)
  | (PropsWithChildren<BaseProps & ButtonHTMLAttributes<HTMLButtonElement>>);

function getButtonClass(variant: ButtonVariant, size: ButtonSize, className?: string) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full border-2 border-charcoal text-center transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40';
  const interactive = 'shadow-tactile-sm hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none';
  const sizes = {
    sm: 'min-h-10 px-4 py-2 font-headline text-[11px] font-bold tracking-[0.01em]',
    md: 'min-h-11 px-5 py-2.5 font-headline text-xs font-bold tracking-[0.01em]',
    lg: 'min-h-12 px-6 py-3 font-headline text-sm font-bold tracking-[0.01em]',
  } satisfies Record<ButtonSize, string>;
  const variants = {
    primary: 'bg-white/95 text-on-surface hover:bg-surface-container-low hover:text-primary hover:shadow-tactile',
    secondary: 'bg-white/85 font-sans font-semibold text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile',
    link: 'border-charcoal/65 bg-white/80 font-sans font-semibold text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile-sm',
  } satisfies Record<ButtonVariant, string>;
  const linkSize = {
    sm: 'min-h-8 px-3 py-1.5 text-[10px]',
    md: 'min-h-9 px-3.5 py-2 text-[11px]',
    lg: 'min-h-10 px-4 py-2 text-xs',
  } satisfies Record<ButtonSize, string>;
  return cn(base, interactive, variant === 'link' ? linkSize[size] : sizes[size], variants[variant], className);
}

export function Button(props: ButtonProps) {
  const variant = props.variant ?? 'primary';
  const size = props.size ?? 'sm';
  const className = getButtonClass(variant, size, props.className);

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
