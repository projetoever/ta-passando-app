# Desenvolvimento local

## Pré-requisitos

- Node.js 22.13 ou superior.
- npm.
- Docker Desktop para o PostgreSQL/PostGIS local.
- Android Studio ou aparelho Android para o development build do vendedor.

## Instalação

```bash
npm install
cp .env.example .env
```

## Banco geográfico

```bash
docker compose -f infra/database/docker-compose.yml up -d
```

O banco de desenvolvimento fica em `localhost:5432`, com a extensão PostGIS e o esquema inicial carregados automaticamente na primeira criação do volume.

## PWA e painel

```bash
npm run dev
```

Rotas:

- `/` — morador.
- `/vendedor` — demonstração web do vendedor.
- `/admin` — administração.

## API

```bash
npm run api:dev
```

- Saúde: `GET http://localhost:3001/health`.
- Capacidades: `GET http://localhost:3001/v1/meta`.
- OpenAPI: `http://localhost:3001/docs`.

## Aplicativo Android do vendedor

```bash
npm run mobile:start
```

O aplicativo está em modo demonstrativo. A configuração nativa já declara as permissões exigidas pelo futuro Modo Rota, mas o código não inicia coleta de GPS nesta etapa.

## Validação completa

```bash
npm run check
```

Esse comando valida lint, TypeScript, testes de domínio/API, build da PWA e o artefato de hospedagem.

