# ADR 0001 — Monólito modular para o piloto

Status: aceito em 31/07/2026.

## Decisão

O TE Vi na TV começa com uma API Fastify única, organizada por módulos de domínio e compartilhando contratos TypeScript com as interfaces. A PWA, o painel e o aplicativo Android são clientes separados dessa API.

## Motivo

O piloto precisa de implantação simples, auditoria centralizada e baixo custo operacional. Microsserviços criariam comunicação distribuída e manutenção antes de existir volume que justifique essa separação.

## Limites preservados

- Identidade e acesso.
- Vendedores e verificação.
- Catálogo.
- Rotas e presença.
- Solicitações.
- Notificações.
- Moderação.
- Auditoria e métricas.

Cada módulo terá contrato e armazenamento próprios dentro do mesmo processo. Localização, notificações e processamento assíncrono poderão ser extraídos quando métricas reais demonstrarem necessidade.
