# Deployment Guide

This repo is designed for the following production setup:

- **GitHub** → source control + CI
- **Vercel** → `apps/web` and `apps/admin`
- **Expo EAS** → `apps/mobile`
- **Supabase** → database, auth, realtime, RPC/functions

---

## 1) Production Architecture

### Public web
- Source: `apps/web`
- Runtime: Next.js 14
- Host: Vercel
- Example domain: `roame.app`

### Admin panel
- Source: `apps/admin`
- Runtime: Next.js 14
- Host: Vercel
- Example domain: `admin.roame.app`

### Mobile app
- Source: `apps/mobile`
- Runtime: Expo / React Native
- Build & distribution: Expo EAS
- iOS release: TestFlight / App Store
- Android release: Internal APK / Play Store

### Backend
- Source of schema: `packages/supabase`
- Host: Supabase
- Includes:
  - Postgres
  - Auth
  - Realtime
  - Edge Functions / RPC

---

## 2) Verified Build Status

The following production builds were verified locally:

- `apps/web` → `npm run build:web` ✅
- `apps/admin` → `npm run build:admin` ✅

That means both Next.js apps are ready to deploy on Vercel.

---

## 3) Vercel Setup

Create **two separate Vercel projects** from the same GitHub repository.

### Project A — Public Web

- **Project name:** `roame-web`
- **Root Directory:** `apps/web`
- **Framework Preset:** Next.js
- **Production Branch:** `main`

#### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Suggested domain
- `roame.app`
- `www.roame.app`

---

### Project B — Admin

- **Project name:** `roame-admin`
- **Root Directory:** `apps/admin`
- **Framework Preset:** Next.js
- **Production Branch:** `main`

#### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

> `SUPABASE_SERVICE_ROLE_KEY` must be added only to the admin project server environment. Never expose it to mobile or public web clients.

#### Suggested domain
- `admin.roame.app`

---

## 4) Expo / EAS Setup

Mobile is not deployed to Vercel.

### Mobile deployment path
1. Build with Expo EAS
2. Distribute preview/internal builds to testers
3. Ship to TestFlight / App Store / Play Store

### Existing config
- `apps/mobile/eas.json`

### Required environment variables for mobile
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Important note for iOS
Publishing installable iOS builds requires an Apple Developer team/account.

---

## 5) Supabase Setup

Supabase is already the backend platform.

### Required secrets for CI / migration flow
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `EXPO_TOKEN`

### Existing workflow files
- `.github/workflows/supabase-migrate.yml`
- `.github/workflows/eas-build.yml`

---

## 6) GitHub → Vercel Flow

Recommended deployment flow:

1. Push code to GitHub
2. Vercel automatically deploys:
   - `apps/web`
   - `apps/admin`
3. GitHub Actions handles:
   - mobile EAS builds
   - Supabase migrations

So the complete stack becomes:

**GitHub + Vercel + Expo EAS + Supabase**

---

## 7) Environment Variable Map

### `apps/web`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### `apps/admin`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### `apps/mobile`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## 8) Local vs Production

### Local development
- Web: `http://localhost:3000`
- Admin: `http://localhost:3001`
- Mobile: Expo dev server

### Production target
- Web: Vercel
- Admin: Vercel
- Mobile: Expo EAS / app stores
- Backend: Supabase

---

## 9) Recommended Final Domains

- Public website: `roame.app`
- Admin dashboard: `admin.roame.app`
- Supabase backend: managed by Supabase project URL

---

## 10) Junior Handoff Summary

If someone asks **"Where is each app hosted?"** use this answer:

- `apps/web` → Vercel
- `apps/admin` → Vercel
- `apps/mobile` → Expo EAS / App Store / Play Store
- `packages/supabase` backend → Supabase
- Source code + CI → GitHub

