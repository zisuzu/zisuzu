# Next.js Endpoints

This file lists every route exposed by the Next.js apps.

## Base Hosts

- Web app (local): `http://localhost:3000`
- Admin app (local): `http://localhost:3001`
- Web app (LAN example): `http://192.168.1.8:3000`
- Admin app (LAN example): `http://192.168.1.8:3001`

---

## Web App (`apps/web`)

| Route | Local URL | Purpose |
|---|---|---|
| `/` | `http://localhost:3000/` | Landing page |
| `/waitlist` | `http://localhost:3000/waitlist` | Waitlist signup |
| `/qr` | `http://localhost:3000/qr` | Device QR helper (Expo/Web/Admin links) |
| `/manifest.webmanifest` | `http://localhost:3000/manifest.webmanifest` | PWA metadata |

## Admin App (`apps/admin`)

| Route | Local URL | Purpose |
|---|---|---|
| `/login` | `http://localhost:3001/login` | Admin login placeholder |
| `/` | `http://localhost:3001/` | Dashboard overview |
| `/users` | `http://localhost:3001/users` | Users table |
| `/activities` | `http://localhost:3001/activities` | Activities table |
| `/reports` | `http://localhost:3001/reports` | Reports queue |
| `/flags` | `http://localhost:3001/flags` | Feature flag list |

## Maintenance Checklist

When adding a Next.js route:

1. Create/modify route file under `apps/web/app/**` or `apps/admin/app/**`.
2. Add the route to this file.
3. Add cross-links in nav where required.

