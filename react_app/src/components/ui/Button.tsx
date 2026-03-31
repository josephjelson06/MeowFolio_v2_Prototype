import type { ButtonHTMLAttributes, AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

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
  const base = variant === 'secondary'
    ? 'pub-link-btn'
    : variant === 'link'
      ? 'r-action'
      : 'btn-new';
  return className ? `${base} ${className}` : base;
}

export function Button(props: ButtonProps) {
  const variant = props.variant ?? 'primary';
  const className = getButtonClass(variant, props.className);

  if ('to' in props) {
    const { to, children } = props;
    return (
      <Link className={className} to={to}>
        {children}
      </Link>
    );
  }

  if ('href' in props) {
    const { href, children } = props;
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }

  const buttonProps = props as PropsWithChildren<BaseProps & ButtonHTMLAttributes<HTMLButtonElement>>;
  const { children, type = 'button', onClick, disabled, title } = buttonProps;
  return (
    <button className={className} type={type} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}
