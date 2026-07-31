# Tá Passando

Plataforma hiperlocal para conectar moradores e vendedores ambulantes em movimento.

O projeto nasce como um piloto em Santo André, inicialmente nos bairros Recreio da Borda do Campo, Parque Miami, Vila Luzita e arredores. A proposta não é apenas mostrar vendedores em um mapa: o morador sinaliza interesse e o vendedor usa a demanda agrupada para decidir por onde vale a pena passar.

## Estado atual

Versão: `0.1.0-pilot`

Este repositório contém o protótipo funcional e responsivo e a primeira fundação técnica do produto:

- `/` — experiência do morador: mapa demonstrativo, pesquisa, categorias, perfis e fluxo “Quero que passe”.
- `/cadastro` — prévia responsiva do onboarding de morador e vendedor.
- `/vendedor` — área operacional: modo rota, demanda por região, solicitações e estados de atendimento.
- `/admin` — gestão do piloto: aprovação de vendedores, cobertura, funil e segurança.

Além da interface, a base agora inclui:

- API Fastify com OpenAPI e validação de tokens OIDC.
- Cadastro persistente de moradores e vendedores.
- Aprovação administrativa com papéis de acesso e auditoria.
- Catálogo persistente por vendedor.
- Contratos TypeScript compartilhados.
- Regras de domínio testadas.
- Aplicativo Android Expo inicial no visual Bairro Vivo.
- PostgreSQL/PostGIS local com esquema geográfico do piloto.
- Pipeline de validação contínua.

Os dados exibidos na demonstração web continuam simulados e o GPS permanece desligado. A API já suporta cadastro e catálogo persistentes quando conectada ao PostgreSQL e ao Google Identity Platform; o ambiente público do piloto ainda não foi provisionado.

## Direção visual

A interface segue o conceito **Bairro Vivo**:

- Verde profundo para confiança e identidade local.
- Laranja para movimento, proximidade e chamadas de ação.
- Fundo creme e cartões claros para uma experiência acolhedora.
- Componentes grandes, linguagem direta e navegação adequada para usuários pouco habituados a aplicativos.
- Layout responsivo para celular, tablet e desktop.

## Segmentos do piloto

- Ovos
- Pães
- Hortifruti
- Queijos
- Produtos de limpeza
- Tapetes e redes
- Churros
- Sorvetes e picolés

## Estrutura

```text
app/                     PWA do morador e painel
apps/seller-mobile/      Android do vendedor
services/api/            API Fastify
packages/contracts/      Contratos compartilhados
packages/domain/         Regras de negócio
infra/database/          PostgreSQL/PostGIS local
docs/                    Arquitetura, escopo e decisões
```

## Começando

Requisitos:

- Node.js 22.13 ou superior
- npm

```bash
npm install
npm run dev
```

Para subir API, banco e aplicativo Android, consulte [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md).

Validações disponíveis:

```bash
npm run lint
npm run check
```

## Próxima evolução técnica

O protótipo atual valida navegação, linguagem e fluxos. A próxima entrega conectará gradualmente a fundação a dados reais:

- Modo Rota com consentimento e testes em aparelho real;
- fluxo “Quero que passe” conectado à API;
- atualizações em tempo real e notificações push.

Veja a especificação em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) e o escopo fechado em [docs/PILOT_SCOPE.md](docs/PILOT_SCOPE.md).

## Princípios de segurança

- Localização do vendedor somente durante o modo rota.
- Nenhum histórico completo de deslocamento exposto ao público.
- Região aproximada do cliente até o vendedor aceitar a parada.
- Ponto de encontro seguro, sem endereço residencial público.
- Retenção curta de posições e trilha de auditoria das ações sensíveis.
- Nenhuma interação que incentive o uso do celular enquanto o vendedor dirige.

## Licença

A definir antes da primeira distribuição pública do produto.
