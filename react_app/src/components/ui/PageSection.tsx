import type { PropsWithChildren, ReactNode } from 'react';

interface PageSectionProps {
  kicker?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageSection({
  kicker,
  title,
  subtitle,
  actions,
  className = '',
  children,
}: PropsWithChildren<PageSectionProps>) {
  return (
    <section className={`ra-section-card${className ? ` ${className}` : ''}`}>
      {(kicker || title || subtitle || actions) && (
        <header className="ra-page-header">
          {kicker ? <div className="ra-page-kicker">{kicker}</div> : null}
          {title ? <h2 className="ra-card-title">{title}</h2> : null}
          {subtitle ? <p className="ra-subtitle">{subtitle}</p> : null}
          {actions ? <div className="ra-actions">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
