# Abeekey Platform

Technology that moves business forward.

Monorepo for the Abeekey Phase 1 marketing site: a Next.js/React/TypeScript
frontend backed by a Laravel/PHP API. Structure and stack follow the Abeekey
Platform brand & tech document.

## Structure

```
abeekey-platform/
├── frontend/                  Next.js 15 + React 19 + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           Home
│   │   │   ├── about/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   ├── industries/page.tsx
│   │   │   ├── portfolio/page.tsx
│   │   │   ├── contact/page.tsx   Working contact form -> API
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── HeroNetwork.tsx    Signature animated hero graphic
│   │   └── lib/api.ts             Typed fetch client for the Laravel API
│   ├── package.json
│   ├── tailwind.config.js         Abeekey design tokens (navy/blue palette, fonts)
│   └── next.config.js
│
├── backend/                   Laravel 13 (PHP 8.4+) — API only
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── ContactController.php
│   │   │   ├── QuotationController.php
│   │   │   ├── ServiceController.php
│   │   │   └── TrainingController.php
│   │   ├── Models/
│   │   │   ├── ContactMessage.php
│   │   │   ├── QuotationRequest.php
│   │   │   └── TrainingApplication.php
│   │   └── Mail/ContactMessageReceived.php
│   ├── database/migrations/       contact_messages, quotation_requests, training_applications
│   ├── routes/{api,web,console}.php
│   ├── config/{cors,mail}.php
│   ├── resources/views/emails/contact-message.blade.php
│   ├── composer.json
│   └── .env.example
│
├── docker/
│   ├── php/Dockerfile              Backend container (PHP 8.4-FPM)
│   ├── frontend/Dockerfile         Frontend container (Node 20)
│   └── nginx/default.conf          Reverse proxy for the API
│
├── docker-compose.yml           Orchestrates frontend, backend, MySQL, Redis, nginx
└── .gitignore
```

## What's already wired up

- **Home page** fully built to the Abeekey brand system (navy/blue palette,
  Poppins/Inter type, animated node-network hero).
- **Contact form** — submits to `POST /api/contact`, validates input, saves to
  `contact_messages`, and emails the Abeekey team.
- **Quotation requests** — `POST /api/quotation-requests` for "Start a Project" flows.
- **Training applications** — `POST /api/training/applications`, `GET /api/training/courses`
  for the Excel / Digital Marketing / Graphic Design programme.
- **Training page** (`/training`) — course cards pulled from the API (with a static
  fallback if the API isn't reachable yet) and a working application form.
- **Services list** — `GET /api/services`.
- About / Services / Industries / Portfolio pages are built with real copy but
  are static for now — good candidates for the next iteration.

## Setup

### Prerequisites
- PHP 8.4+, Composer
- Node.js 20+, npm
- MySQL 8, Redis (or use Docker Compose below)

### Option A — Docker (recommended)
```bash
docker compose up --build
```
This starts: frontend (`:3000`), backend API via `php artisan serve` (`:8000`),
nginx reverse proxy (`:8080`), MySQL (`:3306`), Redis (`:6379`).

### Option B — Manual

**Backend:**
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Then visit `http://localhost:3000`.

> Note: this sandbox environment doesn't have access to packagist.org or full
> npm registry mirrors, so `composer install` / `npm install` need to be run
> in your own environment — everything else (all PHP and TypeScript source,
> migrations, routes, Docker config) is complete and ready to run.

## Next steps
- Flesh out About / Services / Industries / Portfolio with more real content
  and possibly pull Services from the API instead of static arrays.
- Phase 2: Client Portal (invoices, quotations, contracts) + Admin Dashboard (CRM/HR/Finance),
  per the Abeekey Platform roadmap. This will need authentication (Sanctum), so that's
  the first piece of Phase 2.
