"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Egg,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  ShoppingBasket,
  Store,
  UserRound,
} from "lucide-react";

type ProfileKind = "customer" | "seller";
type Step = "profile" | "identity" | "business" | "done";

const neighborhoods = [
  "Recreio da Borda do Campo",
  "Parque Miami",
  "Vila Luzita",
  "Arredores do piloto",
];

const categories = [
  "Ovos",
  "Pães",
  "Hortifruti",
  "Queijos",
  "Produtos de limpeza",
  "Tapetes e redes",
  "Churros",
  "Sorvetes e picolés",
];

export default function RegistrationPreview() {
  const [profile, setProfile] = useState<ProfileKind | null>(null);
  const [step, setStep] = useState<Step>("profile");

  const chooseProfile = (kind: ProfileKind) => {
    setProfile(kind);
    setStep("identity");
  };

  const submitIdentity = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep(profile === "seller" ? "business" : "done");
  };

  const submitBusiness = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep("done");
  };

  const reset = () => {
    setProfile(null);
    setStep("profile");
  };

  return (
    <main className="registration-shell">
      <header className="registration-header">
        <Link className="brand" href="/" aria-label="Tá Passando — início">
          <span className="brand-mark" aria-hidden="true">
            <MapPin size={26} strokeWidth={3} />
            <i />
          </span>
          <span>Tá Passando</span>
          <small>PILOTO</small>
        </Link>
        <span className="secure-label"><ShieldCheck size={16} /> Cadastro protegido</span>
      </header>

      <section className="registration-layout">
        <aside className="registration-aside">
          <span className="section-kicker">Bairro Vivo</span>
          <h1>Uma conta simples para comprar ou vender perto de casa.</h1>
          <p>
            A identidade será confirmada pelo Google Identity Platform. O Tá Passando
            guarda apenas o perfil necessário para operar o piloto.
          </p>

          <ol className="registration-progress" aria-label="Etapas do cadastro">
            <ProgressItem active={step === "profile"} complete={step !== "profile"} number="1" label="Escolher perfil" />
            <ProgressItem active={step === "identity"} complete={step === "business" || step === "done"} number="2" label="Dados básicos" />
            {profile === "seller" && (
              <ProgressItem active={step === "business"} complete={step === "done"} number="3" label="Negócio e catálogo" />
            )}
          </ol>

          <div className="privacy-card">
            <LockKeyhole size={21} />
            <div>
              <strong>Sem GPS nesta etapa</strong>
              <span>A localização de rota continua desligada até consentimento e aprovação.</span>
            </div>
          </div>
        </aside>

        <section className="registration-card" aria-live="polite">
          <span className="demo-pill">Prévia do fluxo • nenhum dado é enviado</span>

          {step === "profile" && (
            <div className="registration-step">
              <span className="step-caption">PASSO 1</span>
              <h2>Como você quer usar o Tá Passando?</h2>
              <p>Você poderá solicitar a mudança de perfil depois.</p>

              <div className="profile-choice-grid">
                <button type="button" onClick={() => chooseProfile("customer")}>
                  <span className="choice-icon green"><UserRound size={29} /></span>
                  <strong>Sou morador</strong>
                  <small>Quero encontrar vendedores e pedir que passem perto de mim.</small>
                  <em>Continuar <ArrowRight size={16} /></em>
                </button>
                <button type="button" onClick={() => chooseProfile("seller")}>
                  <span className="choice-icon orange"><Store size={29} /></span>
                  <strong>Sou vendedor</strong>
                  <small>Quero divulgar minha rota, receber interesses e organizar meu catálogo.</small>
                  <em>Continuar <ArrowRight size={16} /></em>
                </button>
              </div>
            </div>
          )}

          {step === "identity" && (
            <form className="registration-step registration-form" onSubmit={submitIdentity}>
              <button className="back-link" type="button" onClick={reset}><ArrowLeft size={16} /> Voltar</button>
              <span className="step-caption">PASSO 2</span>
              <h2>Seus dados básicos</h2>
              <p>Informações mínimas para reconhecer sua conta e seu bairro.</p>

              <label>
                Nome completo
                <input name="displayName" required minLength={2} placeholder="Como devemos chamar você?" />
              </label>
              <label>
                Bairro principal
                <select name="neighborhood" required defaultValue="">
                  <option value="" disabled>Selecione seu bairro</option>
                  {neighborhoods.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                Telefone para contato
                <input name="phone" type="tel" required placeholder="(11) 99999-9999" />
              </label>

              <div className="identity-provider-note">
                <ShieldCheck size={20} />
                <span><strong>Identidade gerenciada</strong> O acesso real será confirmado por código ou conta Google, sem senha armazenada pelo Tá Passando.</span>
              </div>

              <button className="registration-primary" type="submit">
                {profile === "seller" ? "Continuar para o negócio" : "Concluir prévia"}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {step === "business" && (
            <form className="registration-step registration-form" onSubmit={submitBusiness}>
              <button className="back-link" type="button" onClick={() => setStep("identity")}><ArrowLeft size={16} /> Voltar</button>
              <span className="step-caption">PASSO 3</span>
              <h2>Seu negócio ambulante</h2>
              <p>Essas informações irão para análise antes de o perfil aparecer no mapa.</p>

              <label>
                Nome público do negócio
                <input name="publicName" required minLength={2} placeholder="Ex.: Ovos do João" />
              </label>
              <label>
                Categoria principal
                <select name="category" required defaultValue="">
                  <option value="" disabled>Selecione a categoria</option>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                Primeiro produto
                <div className="product-input-row">
                  <span><Egg size={19} /></span>
                  <input name="product" required placeholder="Ex.: Bandeja com 30 ovos" />
                </div>
              </label>
              <fieldset>
                <legend>Formas de pagamento</legend>
                <label><input type="checkbox" name="payment" value="Pix" defaultChecked /> Pix</label>
                <label><input type="checkbox" name="payment" value="Dinheiro" /> Dinheiro</label>
                <label><input type="checkbox" name="payment" value="Cartão" /> Cartão</label>
              </fieldset>

              <div className="approval-note">
                <ShoppingBasket size={20} />
                <span>O catálogo poderá ser ampliado e editado enquanto o cadastro aguarda aprovação.</span>
              </div>

              <button className="registration-primary" type="submit">
                Enviar prévia para análise <ArrowRight size={18} />
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="registration-step registration-done">
              <span className="done-icon"><CheckCircle2 size={38} /></span>
              <span className="step-caption">FLUXO VALIDADO</span>
              <h2>{profile === "seller" ? "Cadastro pronto para análise" : "Conta pronta para começar"}</h2>
              <p>
                Esta demonstração não gravou dados. A API real já possui os contratos de
                cadastro, catálogo e aprovação; a ativação ocorrerá quando o ambiente do piloto
                for provisionado.
              </p>
              <ul>
                <li><Check size={17} /> Identidade validada pelo provedor</li>
                <li><Check size={17} /> Perfil persistido no PostgreSQL</li>
                {profile === "seller" && <li><Check size={17} /> Aprovação administrativa antes do mapa</li>}
              </ul>
              <div className="done-actions">
                <button type="button" onClick={reset}>Testar outro perfil</button>
                <Link href={profile === "seller" ? "/vendedor" : "/"}>Voltar à demonstração</Link>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function ProgressItem({
  active,
  complete,
  number,
  label,
}: {
  active: boolean;
  complete: boolean;
  number: string;
  label: string;
}) {
  return (
    <li className={`${active ? "active" : ""}${complete ? " complete" : ""}`}>
      <span>{complete ? <Check size={16} /> : number}</span>
      <strong>{label}</strong>
    </li>
  );
}
