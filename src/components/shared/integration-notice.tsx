import { PlugZap } from "lucide-react";

export function IntegrationNotice({ message }: { message?: string }) {
  return <div className="notice" role="status"><PlugZap aria-hidden size={20} /><div><strong>Dados indisponíveis no momento</strong><p>{message ?? "A integração com a API ainda não está configurada. Esta tela exibirá dados reais assim que METRA_API_URL e os contratos do backend forem disponibilizados."}</p></div></div>;
}
