import type { PropsWithChildren } from 'react';

interface CardProps {
  className?: string;
}

export function Card({ children, className = '' }: PropsWithChildren<CardProps>) {
  return <section className={`ra-section-card${className ? ` ${className}` : ''}`}>{children}</section>;
}
