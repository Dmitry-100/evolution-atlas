import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
  decoration?: ReactNode;
  aside?: ReactNode;
};

/** The same title, subtitle and spacing on every route and viewport. */
export function PageHeader({
  eyebrow,
  title,
  children,
  className = "",
  decoration,
  aside,
}: PageHeaderProps) {
  return (
    <header
      className={`page-header${aside ? " page-header--with-aside" : ""} ${className}`}
    >
      {decoration}
      <div className="page-header-copy">
        <p className="page-header-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-header-description">{children}</p>
      </div>
      {aside}
    </header>
  );
}
