# ADR 0002 — Privacidade de localização por padrão

Status: aceito em 31/07/2026.

## Decisão

- O aplicativo só poderá iniciar GPS real após aprovação do vendedor, consentimento explícito e backend autenticado.
- A posição precisa fica restrita à operação; o mapa público recebe uma posição aproximada e com validade curta.
- A base inicial guarda apenas a posição atual. Histórico detalhado não faz parte da fundação.
- Ao encerrar a rota ou expirar a posição, o vendedor deixa de aparecer como ativo.
- Endereço residencial do morador nunca é campo público.

## Consequência

O MVP não otimizará rotas a partir de histórico extensivo. Primeiro validará presença atual, demanda e atendimento com o mínimo de dado pessoal necessário.

