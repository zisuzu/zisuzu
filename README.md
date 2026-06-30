# Roame v2

Mobile-first app for discovering and joining nearby social activities.

## Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Expo Bare) |
| Landing Website | Next.js 14 |
| Admin Dashboard | Next.js 14 |
| Backend | Supabase (Auth, DB, Storage, Realtime, Edge Functions) |
| Database | PostgreSQL + PostGIS |
| CI/CD | GitHub Actions + Expo EAS |

## Monorepo Structure

```
roame-v2/
├── apps/
│   ├── mobile/     # Expo React Native app
│   ├── web/        # Next.js landing site
│   └── admin/      # Next.js admin dashboard
├── packages/
│   ├── supabase/   # DB migrations, Edge Functions, seed data
│   ├── types/      # Shared TypeScript types (generated from Supabase)
│   └── ui/         # Shared design tokens
└── .github/
    └── workflows/  # CI/CD
```

## Getting Started

1. Copy `.env.example` to `.env.local` in each app and fill in values
2. Run `npm install` at root
3. Run `npm run mobile` / `npm run web` / `npm run admin`

## Environment Variables

See `.env.example` at root.

