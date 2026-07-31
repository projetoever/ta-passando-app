"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Home,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Navigation,
  Package,
  Pause,
  Play,
  Route,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";

type RequestStatus = "pending" | "accepted" | "completed" | "declined";

const initialRequests: {
  id: number;
  customer: string;
  product: string;
  quantity: string;
  distance: string;
  wait: string;
  meeting: string;
  status: RequestStatus;
}[] = [
  {
    id: 1,
    customer: "Marina A.",
    product: "30 ovos vermelhos",
    quantity: "1 bandeja",
    distance: "450 m",
    wait: "18 min",
    meeting: "Portaria — Rua Bonifácio",
    status: "pending",
  },
  {
    id: 2,
    customer: "Carlos R.",
    product: "30 ovos brancos",
    quantity: "2 bandejas",
    distance: "780 m",
    wait: "27 min",
    meeting: "Esquina próxima à praça",
    status: "pending",
  },
  {
    id: 3,
    customer: "Ana P.",
    product: "20 ovos caipiras",
    quantity: "1 bandeja",
    distance: "1,1 km",
    wait: "35 min",
    meeting: "Em frente ao mercado",
    status: "accepted",
  },
];

export default function SellerDashboard() {
  const [routeActive, setRouteActive] = useState(true);
  const [requests, setRequests] = useState(initialRequests);

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "pending").length,
    [requests],
  );

  const updateRequest = (id: number, status: RequestStatus) => {
    setRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status } : request)),
    );
  };

  return (
    <main className="operator-shell">
      <aside className="operator-sidebar">
        <Link className="brand operator-brand" href="/" aria-label="Tá Passando — área do vendedor">
          <span className="brand-mark" aria-hidden="true"><MapPin size={25} strokeWidth={3} /><i /></span>
          <span>Tá Passando</span>
        </Link>

        <nav aria-label="Menu do vendedor">
          <a className="active" href="#visao"><LayoutDashboard size={19} /> Visão geral</a>
          <a href="#rota"><Route size={19} /> Minha rota</a>
          <a href="#solicitacoes"><ListChecks size={19} /> Solicitações <em>{pendingCount}</em></a>
          <a href="#catalogo"><Package size={19} /> Catálogo</a>
          <a href="#configuracoes"><Settings size={19} /> Configurações</a>
        </nav>

        <div className="sidebar-profile">
          <span>OZ</span>
          <div><strong>Ovos do Zé</strong><small>Perfil verificado</small></div>
        </div>
      </aside>

      <section className="operator-main" id="visao">
        <header className="operator-topbar">
          <div>
            <span className="dashboard-kicker">Quinta-feira, 31 de julho</span>
            <h1>Bom dia, Zé!</h1>
          </div>
          <div className="operator-top-actions">
            <span className="demo-pill">Demonstração</span>
            <button type="button" aria-label="Notificações"><Bell size={20} /><i>{pendingCount}</i></button>
            <Link href="/" className="client-link"><Home size={18} /> Ver como cliente</Link>
          </div>
        </header>

        <section className={`route-control${routeActive ? " active" : ""}`} id="rota">
          <div className="route-state-icon">{routeActive ? <Navigation size={28} /> : <Pause size={28} />}</div>
          <div className="route-state-copy">
            <span>{routeActive ? "Você está visível no mapa" : "Sua localização está pausada"}</span>
            <strong>{routeActive ? "Rota em andamento" : "Rota encerrada"}</strong>
            <small>{routeActive ? "Iniciada às 08:42 • GPS atualizado agora" : "Os clientes não podem ver sua posição"}</small>
          </div>
          <button type="button" onClick={() => setRouteActive((active) => !active)}>
            {routeActive ? <><Pause size={18} /> Encerrar rota</> : <><Play size={18} /> Iniciar rota</>}
          </button>
        </section>

        <div className="metrics-grid">
          <article><span className="metric-icon orange"><ListChecks size={21} /></span><div><small>Solicitações hoje</small><strong>12</strong><em>+4 desde ontem</em></div></article>
          <article><span className="metric-icon green"><CheckCircle2 size={21} /></span><div><small>Atendimentos</small><strong>8</strong><em>67% de conversão</em></div></article>
          <article><span className="metric-icon amber"><Route size={21} /></span><div><small>Distância em rota</small><strong>14,2 km</strong><em>3 bairros</em></div></article>
          <article><span className="metric-icon blue"><CircleDollarSign size={21} /></span><div><small>Vendas informadas</small><strong>R$ 286</strong><em>Estimativa do vendedor</em></div></article>
        </div>

        <div className="operator-grid">
          <section className="demand-panel" aria-labelledby="demand-title">
            <div className="panel-heading">
              <div><span className="dashboard-kicker">Mapa operacional</span><h2 id="demand-title">Demanda perto da sua rota</h2></div>
              <button type="button">Abrir mapa <ChevronRight size={17} /></button>
            </div>
            <div className="demand-map">
              <div className="map-grid" aria-hidden="true">{Array.from({ length: 12 }).map((_, index) => <span key={index} />)}</div>
              <div className="demand-zone hot"><strong>5</strong><small>interesses</small></div>
              <div className="demand-zone warm"><strong>3</strong><small>interesses</small></div>
              <div className="demand-zone mild"><strong>2</strong><small>interesses</small></div>
              <div className="vendor-position"><Navigation size={21} fill="currentColor" /></div>
              <div className="demand-route" />
              <span className="map-area area-a">RECREIO DA BORDA DO CAMPO</span>
              <span className="map-area area-b">PARQUE MIAMI</span>
              <div className="map-note">Mapa ilustrativo • dados simulados</div>
            </div>
            <div className="demand-insight"><TrendingUp size={20} /><span><strong>Melhor oportunidade agora</strong><small>5 interesses agrupados a 650 m da sua rota atual.</small></span><button type="button">Adicionar parada</button></div>
          </section>

          <section className="requests-panel" id="solicitacoes" aria-labelledby="requests-title">
            <div className="panel-heading">
              <div><span className="dashboard-kicker">Fila ao vivo</span><h2 id="requests-title">Solicitações</h2></div>
              <span className="request-count">{pendingCount} novas</span>
            </div>

            <div className="request-list">
              {requests.map((request) => (
                <article className={`request-card ${request.status}`} key={request.id}>
                  <div className="request-card-top">
                    <span className="customer-avatar">{request.customer.slice(0, 1)}</span>
                    <div><strong>{request.customer}</strong><small><MapPin size={13} /> {request.distance} • espera {request.wait}</small></div>
                    <RequestBadge status={request.status} />
                  </div>
                  <div className="request-product"><Package size={18} /><span><small>Pedido</small><strong>{request.quantity} • {request.product}</strong></span></div>
                  <p>{request.meeting}</p>

                  {request.status === "pending" && (
                    <div className="request-actions">
                      <button type="button" className="decline" onClick={() => updateRequest(request.id, "declined")}><X size={17} /> Recusar</button>
                      <button type="button" className="accept" onClick={() => updateRequest(request.id, "accepted")}><Check size={17} /> Aceitar</button>
                    </div>
                  )}
                  {request.status === "accepted" && (
                    <button type="button" className="complete-action" onClick={() => updateRequest(request.id, "completed")}><CheckCircle2 size={17} /> Marcar como atendido</button>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="operator-footnote"><Activity size={15} /> Protótipo funcional com dados simulados. A localização real será ativada após a validação em campo.</div>
      </section>

      <nav className="mobile-operator-nav" aria-label="Navegação móvel do vendedor">
        <a className="active" href="#visao"><LayoutDashboard size={20} /><span>Início</span></a>
        <a href="#rota"><Route size={20} /><span>Rota</span></a>
        <a href="#solicitacoes"><ListChecks size={20} /><span>Pedidos</span><i>{pendingCount}</i></a>
        <a href="#configuracoes"><Settings size={20} /><span>Ajustes</span></a>
      </nav>
    </main>
  );
}

function RequestBadge({ status }: { status: RequestStatus }) {
  if (status === "accepted") return <span className="status-badge accepted">Aceita</span>;
  if (status === "completed") return <span className="status-badge completed">Atendida</span>;
  if (status === "declined") return <span className="status-badge declined">Recusada</span>;
  return <span className="status-badge pending"><Clock3 size={12} /> Nova</span>;
}
