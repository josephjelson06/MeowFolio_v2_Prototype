import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Button({
  children,
  className,
  disabled,
  onClick,
  to,
  type = 'button',
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  to?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}) {
  if (to) {
    return (
      <Link className={className} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} disabled={disabled} type={type} onClick={onClick}>
      {children}
    </button>
  );
}
