# Tá Passando

Plataforma hiperlocal para conectar moradores e vendedores ambulantes em movimento.

O projeto nasce como um piloto em Santo André, inicialmente nos bairros Recreio da Borda do Campo, Parque Miami, Vila Luzita e arredores. A proposta não é apenas mostrar vendedores em um mapa: o morador sinaliza interesse e o vendedor usa a demanda agrupada para decidir por onde vale a pena passar.

## Estado atual

Versão: `0.1.0-pilot`

Este repositório contém o protótipo funcional e responsivo das três experiências:

- `/` — experiência do morador: mapa demonstrativo, pesquisa, categorias, perfis e fluxo “Quero que passe”.
- `/vendedor` — área operacional: modo rota, demanda por região, solicitações e estados de atendimento.
- `/admin` — gestão do piloto: aprovação de vendedores, cobertura, funil e segurança.

Todos os dados exibidos nesta etapa são simulados. Não existe coleta real de localização, cadastro, pagamento ou envio de pedidos.

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

## Começando

Requisitos:

- Node.js 22.13 ou superior
- npm

```bash
npm install
npm run dev
```

Validações disponíveis:

```bash
npm run lint
npm test
```

## Próxima evolução técnica

O protótipo atual valida navegação, linguagem e fluxos. A implementação do piloto real será separada em:

- PWA responsiva para moradores.
- Aplicativo Android para o vendedor, com localização consciente em segundo plano.
- Painel web administrativo.
- API pública em Node.js/TypeScript.
- PostgreSQL com PostGIS.
- Atualizações em tempo real e notificações push.

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
