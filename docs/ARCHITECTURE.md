# Roame v2 Architecture

## Monorepo Layout

```text
roame-v2/
  apps/
    mobile/   Expo + React Native app
    web/      Next.js marketing + waitlist + QR helper
    admin/    Next.js internal dashboard
  packages/
    supabase/ SQL migrations, edge functions, seeds
    types/    shared database types
    ui/       shared tokens
```

## Runtime Boundaries

- `apps/mobile`: end-user mobile client (Supabase auth + realtime + feed/chat flows).
- `apps/web`: public site and waitlist entrypoint.
- `apps/admin`: internal moderation/operations dashboards.
- `packages/supabase`: source of truth for DB schema/RLS/functions.
- `packages/types`: typed interfaces used by all apps.

## Data Flow

1. Client apps call Supabase (Auth + Postgres + Realtime).
2. Postgres schema and policies are managed only via `packages/supabase/migrations`.
3. `packages/types/database.ts` is regenerated after migration changes.
4. Mobile + Next apps import shared types/tokens from `packages/*`.

## Mobile Route Map (Expo Router)

- `(auth)`
  - `/welcome`
  - `/verify`
- `(tabs)`
  - `/feed`
  - `/chats`
  - `/create`
  - `/activities`
  - `/profile`
- stack screens
  - `/screens/ActivityDetailScreen`
  - `/screens/ActivityChatScreen`

## Backend Modules (Supabase)

- `0001_users.sql`: users/profiles/preferences/devices + signup trigger
- `0002_activities.sql`: activities/categories/tags/locations/participants/waitlist
- `0003_chat.sql`: conversations/messages/reactions/reads/typing
- `0004_social.sql`: follows graph
- `0005_discovery.sql`: geospatial discovery plumbing
- `0006_safety.sql`: reports/blocks/moderation cases
- `0007_system.sql`: app config + feature flags + `nearby_activities` RPC

## Cleanup Rules For Contributors

- Add a dependency only when it is imported in production code.
- Keep route files colocated under each app router (`app/**`).
- Keep generated artifacts out of source control (`node_modules`, `.next`, build outputs).
- Update `docs/ENDPOINTS.md` when adding or removing any Next.js route.

