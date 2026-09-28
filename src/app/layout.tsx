import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Métrica | Conselho de Classe", template: "%s | Métrica" },
  description: "Sistema de métricas educacionais para apoio ao Conselho de Classe.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
