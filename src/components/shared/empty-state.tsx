import type { ReactNode } from "react";

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return <div className="empty">{icon}<strong>{title}</strong>{children}</div>;
}
