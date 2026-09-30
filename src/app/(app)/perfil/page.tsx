import { UserRound } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function ProfilePage() { return <><div className="page-header"><div><h1>Perfil</h1><p className="lede">Preferências e informações da sua conta.</p></div></div><section className="card section"><EmptyState icon={<UserRound aria-hidden size={28} />} title="Perfil conectado pela API"><p>Os dados pessoais e preferências serão apresentados aqui após a integração do endpoint de sessão.</p></EmptyState></section></>; }
