# ADR 0003 — Identidade gerenciada

## Status

Aceito para o piloto.

## Contexto

Moradores e vendedores usarão PWA e Android. Manter senhas, recuperação de acesso, bloqueio de tentativas e confirmação de telefone dentro da API aumentaria risco e desviaria o piloto do fluxo principal.

## Decisão

Usar Google Identity Platform/Firebase Authentication como provedor de identidade. Os clientes obtêm um ID token; a API valida assinatura, emissor e audiência por OIDC/JWKS e associa o `subject` a um usuário interno.

Papéis e estados de negócio permanecem no PostgreSQL:

- todo cadastro novo recebe `customer`;
- o envio de dados comerciais cria um perfil `pending`;
- somente um administrador pode conceder `seller`;
- alterações sensíveis de aprovação geram `audit_events`.

## Consequências

- O Tá Passando não armazena senhas.
- Web e Android usam a mesma identidade.
- A troca futura de provedor é possível porque a API depende do contrato OIDC, não do SDK do cliente.
- A ativação real exige projeto, emissor, audiência e JWKS configurados no ambiente.
- O ambiente sem provedor falha de forma fechada e não oferece credenciais de desenvolvimento em produção.
