import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return <nav className="breadcrumbs" aria-label="Caminho de navegação"><ol>{items.map((item, index) => <li key={`${index}-${item.label}`}>{index > 0 && <ChevronRight size={14} aria-hidden />}{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page" title={item.label}>{item.label}</span>}</li>)}</ol></nav>;
}
