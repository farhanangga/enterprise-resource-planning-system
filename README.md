# ETERA ERP

> *One system, your whole business.*

ETERA is a web-based ERP for small and medium businesses in Indonesia. It brings sales, purchasing, inventory, finance, and HR into one simple platform.

**Status:** Draft (PRD v1.0), MVP in planning

## Features

**MVP (Phase 1)**
- Landing page, Sign Up, Sign In
- Email verification and password reset
- Dashboard with KPI cards and charts
- Settings with Light / Dark / System theme
- Multi-tenant (data isolated per organization)
- Role-based access: Owner, Admin, Manager, Finance, Staff

**Coming later**
- Phase 2: Inventory, Sales, Purchasing, basic reports
- Phase 3: Finance, HR, payment and e-Faktur integrations

## Tech Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API routes or NestJS |
| Database | PostgreSQL 16 |
| ORM | Prisma or Drizzle |
| Auth | Argon2id, JWT + refresh token (httpOnly cookie) |
| Cache | Redis |
| Hosting | Vercel or VPS with Docker |

## Getting Started

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd etera-erp

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Run database migrations
npx prisma migrate dev

# 5. Start the dev server
npm run dev
```

Open http://localhost:3000.

> Commands above assume the recommended stack. Adjust them to match your final setup.

## Main Pages

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/signup` | Create account and organization |
| `/signin` | Log in |
| `/dashboard` | Business overview |
| `/settings` | Theme, profile, security |

## Docs

See the full product requirements in [`PRD_ETERA_ERP.md`](./PRD_ETERA_ERP.md), including the database schema, ERD, and API spec.

## Roadmap

| Phase | Scope | Estimate |
| --- | --- | --- |
| 1 | MVP: auth, dashboard, settings, RBAC | 6-8 weeks |
| 2 | Inventory, Sales, Purchasing | 10-12 weeks |
| 3 | Finance, HR, integrations | 12-16 weeks |

## License

TBD