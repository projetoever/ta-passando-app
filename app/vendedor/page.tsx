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
  Radio,
  Route,
  Settings,
  Square,
  TrendingUp,
  X,
} from "lucide-react";
import type { RequestStatus } from "@ta-passando/contracts";
import { useDemoPilot } from "../demo-pilot";

const initialRequests: {
  id: string;
  customer: string;
  product: string;
  quantity: string;
  distance: string;
  wait: string;
  meeting: string;
  status: RequestStatus;
  source: "sample";
}[] = [
  {
    id: "sample-1",
    customer: "Marina A.",
    product: "30 ovos vermelhos",
    quantity: "1 bandeja",
    distance: "450 m",
    wait: "18 min",
    meeting: "Portaria — Rua Bonifácio",
    status: "pending",
    source: "sample",
  },
  {
    id: "sample-2",
    customer: "Carlos R.",
    product: "30 ovos brancos",
    quantity: "2 bandejas",
    distance: "780 m",
    wait: "27 min",
    meeting: "Esquina próxima à praça",
    status: "pending",
    source: "sample",
  },
  {
    id: "sample-3",
    customer: "Ana P.",
    product: "20 ovos caipiras",
    quantity: "1 bandeja",
    distance: "1,1 km",
    wait: "35 min",
    meeting: "Em frente ao mercado",
    status: "accepted",
    source: "sample",
  },
];

export default function SellerDashboard() {
  const [requests, setRequests] = useState(initialRequests);
  const {
    state: demo,
    transitionRequest,
    setRouteStatus,
    toggleCategory,
    togglePayment,
    resetScenario,
  } = useDemoPilot();

  const routeActive = demo.routeStatus === "active";

  const visibleRequests = useMemo(() => {
    const connected = demo.request
      ? [{
          id: demo.request.id,
          customer: demo.request.customer,
          product: demo.request.product,
          quantity: demo.request.quantity,
          distance: demo.request.distance,
          wait: demo.request.waitLabel,
          meeting: demo.request.meeting,
          status: demo.request.status,
          source: "connected" as const,
        }]
      : [];
    return [...connected, ...requests];
  }, [demo.request, requests]);

  const pendingCount = useMemo(
    () => visibleRequests.filter((request) => request.status === "pending").length,
    [visibleRequests],
  );

  const updateRequest = (id: string, status: RequestStatus) => {
    if (demo.request?.id === id) {
      transitionRequest(status);
      return;
    }
    setRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status } : request)),
    );
  };

  return (
    <main className="operator-shell">
      <aside className="operator-sidebar">
        <Link className="brand operator-brand" href="/" aria-label="TE Vi na TV — área do vendedor">
          <span className="brand-mark" aria-hidden="true"><MapPin size={25} strokeWidth={3} /><i /></span>
          <span>TE Vi na TV</span>
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

        <section className={`route-control ${demo.routeStatus}`} id="rota">
          <div className="route-state-icon">{routeActive ? <Navigation size={28} /> : demo.routeStatus === "paused" ? <Pause size={28} /> : <Square size={28} />}</div>
          <div className="route-state-copy">
            <span>{routeActive ? "Você está visível no mapa" : demo.routeStatus === "paused" ? "Visibilidade temporariamente pausada" : "Você está fora do mapa"}</span>
            <strong>{routeActive ? "Rota em andamento" : demo.routeStatus === "paused" ? "Rota pausada" : "Rota encerrada"}</strong>
            <small>{routeActive ? "Posição simulada atualizada agora" : demo.routeStatus === "paused" ? "Retome quando estiver pronto para atender" : "Inicie a rota para receber novas solicitações"}</small>
          </div>
          <div className="route-control-actions">
            {demo.routeStatus === "active" && <button type="button" onClick={() => setRouteStatus("paused")}><Pause size={17} /> Pausar</button>}
            {demo.routeStatus === "paused" && <button className="resume" type="button" onClick={() => setRouteStatus("active")}><Play size={17} /> Retomar</button>}
            {demo.routeStatus !== "stopped" && <button type="button" onClick={() => setRouteStatus("stopped")}><Square size={16} /> Encerrar</button>}
            {demo.routeStatus === "stopped" && <button className="resume" type="button" onClick={() => setRouteStatus("active")}><Play size={17} /> Iniciar rota</button>}
          </div>
        </section>

        <section className="route-preferences" aria-label="Configuração demonstrativa da rota">
          <div>
            <span><Radio size={16} /> Disponível nesta rota</span>
            <div className="preference-chips">
              {["Ovos frescos", "Ovos caipiras", "Ovos brancos"].map((category) => (
                <button className={demo.activeCategories.includes(category) ? "active" : ""} type="button" key={category} onClick={() => toggleCategory(category)}>{category}</button>
              ))}
            </div>
          </div>
          <div>
            <span>Recebimento</span>
            <div className="preference-chips compact">
              {["Pix", "Cartão", "Dinheiro"].map((payment) => (
                <button className={demo.paymentMethods.includes(payment) ? "active" : ""} type="button" key={payment} onClick={() => togglePayment(payment)}>{payment}</button>
              ))}
            </div>
          </div>
          <div className="radius-summary"><small>Raio de atendimento</small><strong>{demo.serviceRadius}</strong></div>
        </section>

        <div className="metrics-grid">
          <article><span className="metric-icon orange"><ListChecks size={21} /></span><div><small>Solicitações hoje</small><strong>{12 + (demo.request ? 1 : 0)}</strong><em>{demo.request ? "1 conectada ao morador" : "+4 desde ontem"}</em></div></article>
          <article><span className="metric-icon green"><CheckCircle2 size={21} /></span><div><small>Atendimentos</small><strong>{8 + (demo.request?.status === "completed" ? 1 : 0)}</strong><em>conclusões confirmadas</em></div></article>
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
              {visibleRequests.map((request) => (
                <article className={`request-card ${request.status}${request.source === "connected" ? " connected" : ""}`} key={request.id}>
                  {request.source === "connected" && <span className="connected-label">SIMULAÇÃO DO MORADOR</span>}
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
                    <button type="button" className="complete-action" onClick={() => updateRequest(request.id, "on_the_way")}><Navigation size={17} /> Estou a caminho</button>
                  )}
                  {request.status === "on_the_way" && (
                    <button type="button" className="complete-action" onClick={() => updateRequest(request.id, "arrived")}><MapPin size={17} /> Cheguei ao ponto</button>
                  )}
                  {request.status === "arrived" && (
                    <button type="button" className="complete-action" onClick={() => updateRequest(request.id, "completed")}><CheckCircle2 size={17} /> Concluir atendimento</button>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="operator-footnote"><Activity size={15} /> Fluxo integrado no aparelho. GPS e notificações reais continuam desativados. {demo.request && <button type="button" onClick={resetScenario}>Reiniciar cenário</button>}</div>
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
  if (status === "on_the_way") return <span className="status-badge on-the-way">A caminho</span>;
  if (status === "arrived") return <span className="status-badge arrived">Chegou</span>;
  if (status === "completed") return <span className="status-badge completed">Atendida</span>;
  if (status === "declined") return <span className="status-badge declined">Recusada</span>;
  if (status === "cancelled") return <span className="status-badge declined">Cancelada</span>;
  if (status === "expired") return <span className="status-badge declined">Expirada</span>;
  return <span className="status-badge pending"><Clock3 size={12} /> Nova</span>;
}
