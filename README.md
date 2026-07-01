# Roame v2

Monorepo for Roame mobile, web, admin, and Supabase backend.

## Documentation

- Architecture: `docs/ARCHITECTURE.md`
- Next.js endpoints: `docs/ENDPOINTS.md`
- Deployment: `docs/DEPLOYMENT.md`

## Apps

- `apps/mobile` - Expo React Native app
- `apps/web` - Next.js public site
- `apps/admin` - Next.js internal dashboard

## Packages

- `packages/supabase` - SQL migrations, edge functions, seed
- `packages/types` - shared DB types
- `packages/ui` - shared design tokens

## Quick Start

1. Fill env vars from `.env.example`.
2. Install dependencies:

```bash
npm install
```

3. Run apps:

```bash
# mobile
npm run mobile

# web (localhost:3000)
npm run web

# admin (localhost:3001)
npm run admin
```

## Build Commands

```bash
npm run build:web
npm run build:admin
```

## Database Commands

```bash
npm run db:migrate
npm run db:types
```

