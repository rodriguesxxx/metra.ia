import type { CSSProperties, ReactNode } from "react";

export function MetricCard({ label, value, icon, children, className, style }: {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return <article className={`card metric${className ? ` ${className}` : ""}`} style={style}>{icon}<div className="metric-label">{label}</div><div className="metric-value">{value}</div>{children}</article>;
}
