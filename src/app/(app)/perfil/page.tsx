import { UserRound } from "lucide-react";

export default function ProfilePage() { return <><div className="page-header"><div><h1>Perfil</h1><p className="lede">Preferências e informações da sua conta.</p></div></div><section className="card section"><div className="empty"><UserRound aria-hidden size={28} /><strong>Perfil conectado pela API</strong><p>Os dados pessoais e preferências serão apresentados aqui após a integração do endpoint de sessão.</p></div></section></>; }
