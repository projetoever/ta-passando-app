"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  ChartColumnIncreasing,
  Check,
  CircleCheck,
  CircleX,
  Database,
  Eye,
  FileCheck2,
  Flag,
  Gauge,
  Home,
  LayoutDashboard,
  Map,
  MapPin,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  UserCheck,
  Users,
  X,
} from "lucide-react";

type SellerReviewStatus = "pending" | "approved" | "rejected";

const initialSellerReviews = [
  { id: 1, initials: "PT", name: "Pães da Tarde", owner: "Roberto Alves", category: "Pães", neighborhood: "Parque Miami", submitted: "Hoje, 08:14", status: "pending" as SellerReviewStatus },
  { id: 2, initials: "LC", name: "Limpeza da Cida", owner: "Aparecida Lima", category: "Limpeza", neighborhood: "Vila Luzita", submitted: "Ontem, 17:32", status: "pending" as SellerReviewStatus },
  { id: 3, initials: "RC", name: "Redes do Ceará", owner: "Francisco Santos", category: "Tapetes e redes", neighborhood: "Recreio", submitted: "Ontem, 11:09", status: "pending" as SellerReviewStatus },
];

export default function AdminDashboard() {
  const [sellerReviews, setSellerReviews] = useState(initialSellerReviews);

  const reviewSeller = (id: number, status: SellerReviewStatus) => {
    setSellerReviews((current) =>
      current.map((seller) => (seller.id === id ? { ...seller, status } : seller)),
    );
  };

  const pending = sellerReviews.filter((seller) => seller.status === "pending").length;

  return (
    <main className="operator-shell admin-shell">
      <aside className="operator-sidebar admin-sidebar">
        <Link className="brand operator-brand" href="/" aria-label="Tá Passando — administração">
          <span className="brand-mark" aria-hidden="true"><MapPin size={25} strokeWidth={3} /><i /></span>
          <span>Tá Passando</span>
        </Link>
        <span className="role-label">ADMINISTRAÇÃO DO PILOTO</span>

        <nav aria-label="Menu administrativo">
          <a className="active" href="#visao"><LayoutDashboard size={19} /> Visão geral</a>
          <a href="#vendedores"><Store size={19} /> Vendedores <em>{pending}</em></a>
          <a href="#usuarios"><Users size={19} /> Moradores</a>
          <a href="#regioes"><Map size={19} /> Bairros e regiões</a>
          <a href="#denuncias"><Flag size={19} /> Denúncias</a>
          <a href="#dados"><Database size={19} /> Dados do piloto</a>
          <a href="#configuracoes"><Settings size={19} /> Configurações</a>
        </nav>

        <div className="sidebar-profile">
          <span>AD</span>
          <div><strong>Administrador</strong><small>Acesso demonstrativo</small></div>
        </div>
      </aside>

      <section className="operator-main admin-main" id="visao">
        <header className="operator-topbar">
          <div><span className="dashboard-kicker">Central de operação</span><h1>Painel do piloto</h1></div>
          <div className="operator-top-actions">
            <span className="demo-pill">Santo André • 30 dias</span>
            <button type="button" aria-label="Notificações"><Bell size={20} /><i>{pending}</i></button>
            <Link href="/" className="client-link"><Home size={18} /> Voltar ao app</Link>
          </div>
        </header>

        <section className="pilot-banner">
          <div className="pilot-state"><span className="live-dot" /><div><small>PILOTO EM PREPARAÇÃO</small><strong>Base operacional pronta para validação</strong></div></div>
          <div className="pilot-progress"><span><strong>6 de 8</strong><small>vendedores recrutados</small></span><div><i style={{ width: "75%" }} /></div></div>
          <button type="button"><Gauge size={18} /> Ver critérios de avanço</button>
        </section>

        <div className="admin-metrics">
          <article><span className="metric-icon green"><Store size={21} /></span><div><small>Vendedores ativos</small><strong>6</strong><em>Meta: 8</em></div><b>75%</b></article>
          <article><span className="metric-icon blue"><Users size={21} /></span><div><small>Moradores convidados</small><strong>84</strong><em>Meta: 100</em></div><b>84%</b></article>
          <article><span className="metric-icon orange"><ChartColumnIncreasing size={21} /></span><div><small>Interesses simulados</small><strong>47</strong><em>Últimos 7 dias</em></div><b>+18%</b></article>
          <article><span className="metric-icon amber"><ShieldCheck size={21} /></span><div><small>Incidentes críticos</small><strong>0</strong><em>Meta obrigatória</em></div><b className="safe">OK</b></article>
        </div>

        <div className="admin-layout">
          <section className="review-panel" id="vendedores" aria-labelledby="review-title">
            <div className="panel-heading">
              <div><span className="dashboard-kicker">Ação necessária</span><h2 id="review-title">Cadastros para revisar</h2></div>
              <button type="button"><SlidersHorizontal size={15} /> Filtrar</button>
            </div>

            <div className="review-table" role="table" aria-label="Cadastros de vendedores">
              <div className="review-head" role="row"><span>Vendedor</span><span>Categoria</span><span>Região</span><span>Envio</span><span>Ações</span></div>
              {sellerReviews.map((seller) => (
                <div className={`review-row ${seller.status}`} role="row" key={seller.id}>
                  <span className="seller-cell"><i>{seller.initials}</i><span><strong>{seller.name}</strong><small>{seller.owner}</small></span></span>
                  <span>{seller.category}</span>
                  <span>{seller.neighborhood}</span>
                  <span>{seller.submitted}</span>
                  <span className="review-actions">
                    {seller.status === "pending" ? (
                      <>
                        <button type="button" aria-label={`Ver ${seller.name}`}><Eye size={16} /></button>
                        <button type="button" className="reject" aria-label={`Recusar ${seller.name}`} onClick={() => reviewSeller(seller.id, "rejected")}><X size={16} /></button>
                        <button type="button" className="approve" aria-label={`Aprovar ${seller.name}`} onClick={() => reviewSeller(seller.id, "approved")}><Check size={16} /></button>
                      </>
                    ) : seller.status === "approved" ? (
                      <span className="reviewed approved"><CircleCheck size={15} /> Aprovado</span>
                    ) : (
                      <span className="reviewed rejected"><CircleX size={15} /> Recusado</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <aside className="pilot-health" aria-labelledby="health-title">
            <div className="panel-heading"><div><span className="dashboard-kicker">Saúde do piloto</span><h2 id="health-title">Por bairro</h2></div></div>
            <div className="neighborhood-health">
              <HealthRow name="Recreio da Borda" value={82} sellers="3 vendedores" tone="green" />
              <HealthRow name="Parque Miami" value={68} sellers="2 vendedores" tone="orange" />
              <HealthRow name="Vila Luzita" value={54} sellers="1 vendedor" tone="amber" />
            </div>
            <div className="coverage-map">
              <span className="coverage-zone zone-a">3</span>
              <span className="coverage-zone zone-b">2</span>
              <span className="coverage-zone zone-c">1</span>
              <b>RECREIO</b><b>PARQUE MIAMI</b><b>VILA LUZITA</b>
              <div className="map-note">Cobertura ilustrativa</div>
            </div>
          </aside>
        </div>

        <div className="admin-bottom-grid">
          <section className="funnel-panel">
            <div className="panel-heading"><div><span className="dashboard-kicker">Últimos 7 dias</span><h2>Funil de solicitações</h2></div></div>
            <div className="funnel-bars">
              <FunnelBar label="Interesses enviados" value={47} percentage={100} tone="orange" />
              <FunnelBar label="Aceitos" value={26} percentage={55} tone="green" />
              <FunnelBar label="Atendidos" value={19} percentage={40} tone="blue" />
            </div>
            <p><FileCheck2 size={16} /> Conversão experimental de atendimento: <strong>40%</strong>. Meta mínima da validação: 25%.</p>
          </section>

          <section className="alerts-panel" id="denuncias">
            <div className="panel-heading"><div><span className="dashboard-kicker">Segurança e operação</span><h2>Atenção necessária</h2></div></div>
            <article><span className="alert-icon warning"><AlertTriangle size={19} /></span><div><strong>2 vendedores sem documento municipal</strong><small>Verificação opcional aguardando análise.</small></div><button type="button">Revisar</button></article>
            <article><span className="alert-icon safe"><ShieldCheck size={19} /></span><div><strong>Nenhuma denúncia crítica</strong><small>Última verificação há 6 minutos.</small></div><button type="button">Detalhes</button></article>
          </section>
        </div>

        <div className="operator-footnote"><UserCheck size={15} /> Demonstração administrativa: nenhuma aprovação altera dados reais.</div>
      </section>

      <nav className="mobile-operator-nav" aria-label="Navegação administrativa móvel">
        <a className="active" href="#visao"><LayoutDashboard size={20} /><span>Início</span></a>
        <a href="#vendedores"><Store size={20} /><span>Vendedores</span><i>{pending}</i></a>
        <a href="#regioes"><Map size={20} /><span>Bairros</span></a>
        <a href="#configuracoes"><Settings size={20} /><span>Ajustes</span></a>
      </nav>
    </main>
  );
}

function HealthRow({ name, value, sellers, tone }: { name: string; value: number; sellers: string; tone: string }) {
  return <div className="health-row"><span><strong>{name}</strong><small>{sellers}</small></span><b>{value}%</b><div><i className={tone} style={{ width: `${value}%` }} /></div></div>;
}

function FunnelBar({ label, value, percentage, tone }: { label: string; value: number; percentage: number; tone: string }) {
  return <div className="funnel-row"><span><strong>{label}</strong><b>{value}</b></span><div><i className={tone} style={{ width: `${percentage}%` }} /></div><small>{percentage}% dos interesses</small></div>;
}
