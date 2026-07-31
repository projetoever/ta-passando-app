"use client";

import type { ComponentType, FormEvent } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Carrot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Cookie,
  Egg,
  Heart,
  IceCreamBowl,
  LeafyGreen,
  MapPin,
  Navigation,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBasket,
  SprayCan,
  Store,
  Wheat,
  X,
} from "lucide-react";

type Icon = ComponentType<{ size?: number; strokeWidth?: number }>;
type SheetStep = "details" | "request" | "sent";

type Seller = {
  id: number;
  name: string;
  category: string;
  product: string;
  eta: string;
  neighborhood: string;
  description: string;
  products: string[];
  payment: string;
  className: string;
  tone: "orange" | "green";
  icon: Icon;
};

const categories: { id: string; label: string; icon: Icon }[] = [
  { id: "todos", label: "Todos", icon: Store },
  { id: "ovos", label: "Ovos", icon: Egg },
  { id: "paes", label: "Pães", icon: Wheat },
  { id: "hortifruti", label: "Hortifruti", icon: LeafyGreen },
  { id: "queijos", label: "Queijos", icon: ShoppingBasket },
  { id: "limpeza", label: "Limpeza", icon: SprayCan },
  { id: "churros", label: "Churros", icon: Cookie },
  { id: "sorvetes", label: "Sorvetes", icon: IceCreamBowl },
];

const sellers: Seller[] = [
  {
    id: 1,
    name: "Ovos do Zé",
    category: "ovos",
    product: "Ovos frescos",
    eta: "Passando agora",
    neighborhood: "Recreio da Borda do Campo",
    description: "Ovos brancos e vermelhos entregues direto do produtor.",
    products: ["30 ovos brancos", "30 ovos vermelhos", "20 ovos caipiras"],
    payment: "Pix, cartão ou dinheiro",
    className: "seller-one",
    tone: "orange",
    icon: Egg,
  },
  {
    id: 2,
    name: "Pães da Tarde",
    category: "paes",
    product: "Pães e bolos",
    eta: "A 3 min de você",
    neighborhood: "Parque Miami",
    description: "Pães quentinhos, bolos caseiros e café para levar.",
    products: ["Pão francês", "Bolo de milho", "Pão doce"],
    payment: "Pix, cartão ou dinheiro",
    className: "seller-two",
    tone: "orange",
    icon: Wheat,
  },
  {
    id: 3,
    name: "Horta do Bairro",
    category: "hortifruti",
    product: "Verduras e legumes",
    eta: "A 2 min de você",
    neighborhood: "Vila Luzita",
    description: "Hortifruti selecionado com rota semanal pelos bairros.",
    products: ["Cesta pequena", "Cesta família", "Itens avulsos"],
    payment: "Pix ou dinheiro",
    className: "seller-three",
    tone: "green",
    icon: Carrot,
  },
  {
    id: 4,
    name: "Churros da Praça",
    category: "churros",
    product: "Churros artesanais",
    eta: "Passando agora",
    neighborhood: "Recreio da Borda do Campo",
    description: "Churros preparados na hora, com recheios tradicionais.",
    products: ["Doce de leite", "Chocolate", "Mini churros"],
    payment: "Pix, cartão ou dinheiro",
    className: "seller-four",
    tone: "orange",
    icon: Cookie,
  },
];

export default function Home() {
  const [category, setCategory] = useState("todos");
  const [query, setQuery] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [sheetStep, setSheetStep] = useState<SheetStep>("details");
  const [favorites, setFavorites] = useState<number[]>([3]);

  const visibleSellers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return sellers.filter((seller) => {
      const matchesCategory = category === "todos" || seller.category === category;
      const matchesSearch =
        !normalized ||
        seller.name.toLocaleLowerCase("pt-BR").includes(normalized) ||
        seller.product.toLocaleLowerCase("pt-BR").includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }, [category, query]);

  const focusSearch = () => {
    document.querySelector<HTMLInputElement>("#seller-search")?.focus();
  };

  const openSeller = (seller: Seller) => {
    setSelectedSeller(seller);
    setSheetStep("details");
  };

  const closeSeller = () => {
    setSelectedSeller(null);
    setSheetStep("details");
  };

  const toggleFavorite = (sellerId: number) => {
    setFavorites((current) =>
      current.includes(sellerId)
        ? current.filter((id) => id !== sellerId)
        : [...current, sellerId],
    );
  };

  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSheetStep("sent");
  };

  return (
    <main className="client-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Tá Passando — início">
          <span className="brand-mark" aria-hidden="true">
            <MapPin size={28} strokeWidth={3} />
            <i />
          </span>
          <span>Tá Passando</span>
          <small>PILOTO</small>
        </a>

        <div className="topbar-actions">
          <span className="demo-pill">Dados demonstrativos</span>
          <Link className="outline-button" href="/vendedor">
            <Store size={18} />
            Sou vendedor
          </Link>
        </div>
      </header>

      <section className="discovery" id="inicio">
        <div className="discovery-copy">
          <button className="location-select" type="button">
            <MapPin size={21} />
            <span>Recreio da Borda do Campo</span>
            <ChevronDown size={19} />
          </button>

          <div className="eyebrow">
            <span className="live-dot" />
            Comércio do bairro em movimento
          </div>

          <h1>Encontre quem está passando perto de você</h1>
          <p className="lead">
            Descubra vendedores na sua região, acompanhe a aproximação e avise
            quando quiser comprar.
          </p>

          <label className="search-box" htmlFor="seller-search">
            <Search size={24} />
            <input
              id="seller-search"
              type="search"
              placeholder="O que você quer encontrar?"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <button className="primary-button" type="button" onClick={focusSearch}>
            <Navigation size={20} />
            Ver vendedores perto de mim
          </button>

          <div className="category-grid" aria-label="Filtrar por categoria">
            {categories.slice(1, 7).map((item) => {
              const CategoryIcon = item.icon;
              const active = category === item.id;
              return (
                <button
                  className={`category-card${active ? " active" : ""}`}
                  type="button"
                  key={item.id}
                  aria-pressed={active}
                  onClick={() => setCategory(active ? "todos" : item.id)}
                >
                  <CategoryIcon size={27} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="map-frame" aria-label="Mapa demonstrativo de vendedores ativos">
          <div className="map-meta">
            <span className="live-dot" />
            <strong>{visibleSellers.length} vendedores visíveis</strong>
          </div>

          <div className="map-grid" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
          <div className="map-park park-one">Praça do Recreio</div>
          <div className="map-park park-two">Parque Central</div>
          <div className="neighborhood neighborhood-one">PARQUE MIAMI</div>
          <div className="neighborhood neighborhood-two">RECREIO DA<br />BORDA DO CAMPO</div>
          <div className="neighborhood neighborhood-three">VILA LUZITA</div>

          <div className="route route-orange" />
          <div className="route route-green" />

          {visibleSellers.map((seller) => {
            const SellerIcon = seller.icon;
            return (
              <button
                type="button"
                key={seller.id}
                className={`seller-marker ${seller.className} ${seller.tone}`}
                aria-label={`${seller.name}, ${seller.eta}`}
                onClick={() => openSeller(seller)}
              >
                <span className="pin">
                  <MapPin size={28} fill="currentColor" />
                </span>
                <span className="seller-bubble">
                  <span className="seller-icon"><SellerIcon size={23} /></span>
                  <span>
                    <strong>{seller.name}</strong>
                    <small><i />{seller.eta}</small>
                  </span>
                </span>
              </button>
            );
          })}

          {visibleSellers.length === 0 && (
            <div className="map-empty">
              <Search size={24} />
              Nenhum vendedor encontrado neste filtro.
            </div>
          )}

          <div className="map-note">Mapa ilustrativo • posições simuladas</div>
        </div>
      </section>

      <section className="nearby-section" aria-labelledby="nearby-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Agora no bairro</span>
            <h2 id="nearby-title">Vendedores perto de você</h2>
          </div>
          <button type="button" onClick={() => setCategory("todos")}>Ver todos <ChevronRight size={18} /></button>
        </div>

        <div className="nearby-grid">
          {sellers.map((seller) => {
            const SellerIcon = seller.icon;
            const favorite = favorites.includes(seller.id);
            return (
              <article className="nearby-card" key={seller.id}>
                <button
                  type="button"
                  className={`favorite-button${favorite ? " active" : ""}`}
                  aria-label={favorite ? `Remover ${seller.name} dos favoritos` : `Favoritar ${seller.name}`}
                  onClick={() => toggleFavorite(seller.id)}
                >
                  <Heart size={19} fill={favorite ? "currentColor" : "none"} />
                </button>
                <div className={`nearby-icon ${seller.tone}`}><SellerIcon size={27} /></div>
                <span className="verified"><ShieldCheck size={14} /> Perfil verificado</span>
                <h3>{seller.name}</h3>
                <p>{seller.product}</p>
                <div className="card-meta">
                  <span><Clock3 size={15} /> {seller.eta}</span>
                  <span><MapPin size={15} /> {seller.neighborhood}</span>
                </div>
                <button type="button" className="card-action" onClick={() => openSeller(seller)}>
                  Ver perfil <ChevronRight size={17} />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="how-section" aria-labelledby="how-title">
        <div className="how-copy">
          <span className="section-kicker">Simples para os dois lados</span>
          <h2 id="how-title">Você avisa. O vendedor decide se consegue passar.</h2>
          <p>
            O endereço exato não fica exposto no mapa. Primeiro você escolhe um
            ponto seguro e uma janela de espera; depois acompanha o aceite.
          </p>
        </div>
        <ol className="steps-list">
          <li><span>1</span><div><strong>Encontre</strong><small>Veja quem já está em rota.</small></div></li>
          <li><span>2</span><div><strong>Avise</strong><small>Informe o produto e onde espera.</small></div></li>
          <li><span>3</span><div><strong>Acompanhe</strong><small>Receba aceite e aproximação.</small></div></li>
        </ol>
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#inicio"><MapPin size={22} /> Tá Passando</a>
        <p>Piloto hiperlocal • Santo André, SP</p>
        <Link href="/admin">Acessar demonstração administrativa</Link>
      </footer>

      <div className="mobile-status">
        <span><i className="live-dot" /> {visibleSellers.length} próximos</span>
        <button type="button" onClick={focusSearch}>Buscar</button>
      </div>

      {selectedSeller && (
        <div className="sheet-layer">
          <button className="sheet-backdrop" type="button" aria-label="Fechar perfil" onClick={closeSeller} />
          <aside className="seller-sheet" role="dialog" aria-modal="true" aria-label={`Perfil de ${selectedSeller.name}`}>
            <button className="sheet-close" type="button" aria-label="Fechar" onClick={closeSeller}>
              <X size={21} />
            </button>

            {sheetStep === "details" && (
              <SellerDetails
                seller={selectedSeller}
                favorite={favorites.includes(selectedSeller.id)}
                onFavorite={() => toggleFavorite(selectedSeller.id)}
                onRequest={() => setSheetStep("request")}
              />
            )}

            {sheetStep === "request" && (
              <form className="request-form" onSubmit={submitRequest}>
                <button className="text-back" type="button" onClick={() => setSheetStep("details")}>← Voltar ao perfil</button>
                <span className="section-kicker">Solicitação sem compromisso</span>
                <h2>O que você quer comprar?</h2>
                <p>O vendedor verá uma região aproximada até aceitar a parada.</p>

                <label>
                  Produto
                  <select defaultValue={selectedSeller.products[0]}>
                    {selectedSeller.products.map((product) => <option key={product}>{product}</option>)}
                  </select>
                </label>
                <div className="form-row">
                  <label>
                    Quantidade
                    <select defaultValue="1"><option>1</option><option>2</option><option>3</option><option>4+</option></select>
                  </label>
                  <label>
                    Posso esperar
                    <select defaultValue="20 minutos"><option>10 minutos</option><option>20 minutos</option><option>30 minutos</option><option>1 hora</option></select>
                  </label>
                </div>
                <label>
                  Ponto de encontro seguro
                  <select defaultValue="Portaria / frente de casa"><option>Portaria / frente de casa</option><option>Esquina próxima</option><option>Comércio de referência</option><option>Praça ou ponto público</option></select>
                </label>
                <label>
                  Referência <span>(opcional)</span>
                  <input type="text" placeholder="Ex.: próximo à farmácia" />
                </label>
                <div className="privacy-note"><ShieldCheck size={18} /> Seu endereço exato não aparece publicamente no mapa.</div>
                <button className="primary-button" type="submit"><Bell size={19} /> Enviar interesse</button>
              </form>
            )}

            {sheetStep === "sent" && (
              <div className="request-success">
                <div className="success-icon"><CheckCircle2 size={40} /></div>
                <span className="section-kicker">Interesse enviado</span>
                <h2>Agora é só aguardar o aceite</h2>
                <p>{selectedSeller.name} recebeu sua solicitação demonstrativa.</p>
                <div className="status-timeline">
                  <span className="done"><i><PackageCheck size={17} /></i><strong>Solicitação enviada</strong><small>agora</small></span>
                  <span><i><Clock3 size={17} /></i><strong>Aguardando vendedor</strong><small>expira em 20 min</small></span>
                  <span><i><Navigation size={17} /></i><strong>A caminho</strong><small>após o aceite</small></span>
                </div>
                <button className="primary-button" type="button" onClick={closeSeller}>Entendi</button>
                <small className="simulation-label">Simulação do fluxo do piloto — nenhum pedido real foi enviado.</small>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

function SellerDetails({
  seller,
  favorite,
  onFavorite,
  onRequest,
}: {
  seller: Seller;
  favorite: boolean;
  onFavorite: () => void;
  onRequest: () => void;
}) {
  const SellerIcon = seller.icon;

  return (
    <div className="seller-details">
      <div className="sheet-hero">
        <div className={`sheet-seller-icon ${seller.tone}`}><SellerIcon size={38} /></div>
        <button className={`favorite-button large${favorite ? " active" : ""}`} type="button" onClick={onFavorite} aria-label="Favoritar vendedor">
          <Heart size={21} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <span className="verified"><ShieldCheck size={15} /> Vendedor verificado no piloto</span>
      <h2>{seller.name}</h2>
      <div className="seller-live"><span className="live-dot" /> {seller.eta} • {seller.neighborhood}</div>
      <p>{seller.description}</p>

      <div className="sheet-section">
        <span>Produtos em destaque</span>
        <div className="product-list">
          {seller.products.map((product) => <strong key={product}>{product}</strong>)}
        </div>
      </div>
      <div className="payment-row"><ShoppingBasket size={19} /><span><small>Formas de pagamento</small><strong>{seller.payment}</strong></span></div>

      <button className="primary-button" type="button" onClick={onRequest}>
        <Navigation size={20} /> Quero que passe por aqui
      </button>
      <p className="safe-copy"><ShieldCheck size={16} /> Você escolhe um ponto seguro de encontro. O endereço não fica público.</p>
    </div>
  );
}
