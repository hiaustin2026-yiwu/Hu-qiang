# YiwuChristmas.ai Deployment Guide

## Preflight

Run these checks before pushing:

```bash
npm install
npx prisma generate
npm run build
```

Required package scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

The current project uses Prisma + SQLite for local development. Do not use the local SQLite database as the production database on Vercel because the filesystem is ephemeral. Use PostgreSQL for production.

## Push To GitHub

```bash
git init
git add .
git commit -m "Initial YiwuChristmas.ai platform"
git branch -M main
git remote add origin git@github.com:YOUR_ORG/yiwuchristmas-ai.git
git push -u origin main
```

If the repository already exists locally, only run:

```bash
git add .
git commit -m "Prepare YiwuChristmas.ai deployment"
git push
```

Do not commit `.env`, `prisma/dev.db`, or private API keys.

## Connect Vercel

1. Open Vercel and choose `Add New Project`.
2. Import the GitHub repository.
3. Framework preset: `Next.js`.
4. Build command: `npm run build`.
5. Install command: `npm install`.
6. Output directory: leave as Next.js default.
7. Add environment variables from `.env.example`.
8. Deploy.

## Environment Variables

Set these in Vercel Project Settings:

```bash
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=https://yiwuchristmas.ai
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_AMAP_KEY=
NEXT_PUBLIC_PRIMARY_DOMAIN=yiwuchristmas.com
NEXT_PUBLIC_AI_DOMAIN=yiwuchristmas.ai
NEXT_PUBLIC_CHINA_DOMAIN=cn.yiwuchristmas.com
NEXT_PUBLIC_APP_DOMAIN=app.yiwuchristmas.com
NEXT_PUBLIC_CONTACT_EMAIL=sales@yiwuchristmas.ai
NEXT_PUBLIC_WHATSAPP_NUMBER=8613800000000
```

For production, replace `DATABASE_URL` with a PostgreSQL connection string. After switching to PostgreSQL, update `prisma/schema.prisma` datasource provider from `sqlite` to `postgresql`, run a new migration, and deploy the migration to the production database.

## Bind yiwuchristmas.ai

1. In Vercel Project Settings, open `Domains`.
2. Add `yiwuchristmas.ai`.
3. Add `www.yiwuchristmas.ai` if needed.
4. Follow Vercel's DNS instructions:
   - Apex domain usually uses an `A` record.
   - `www` usually uses a `CNAME` record.
5. Set `NEXT_PUBLIC_SITE_URL=https://yiwuchristmas.ai`.
6. Redeploy after environment variables change.

Optional future domains:

- `yiwuchristmas.com`
- `cn.yiwuchristmas.com`
- `app.yiwuchristmas.com`

## Production Database Plan

Use a managed PostgreSQL provider such as Vercel Postgres, Neon, Supabase, or Railway.

Recommended next steps:

1. Create a PostgreSQL database.
2. Change Prisma provider to `postgresql`.
3. Set production `DATABASE_URL` in Vercel.
4. Run Prisma migration against production.
5. Seed or import real merchants and SKUs through the admin import tools.

## Docker / Linux Server

```bash
docker build -t yiwuchristmas-ai .
docker run -p 3000:3000 --env-file .env yiwuchristmas-ai
```

For a Linux server, use PostgreSQL and a process manager such as `pm2` or a container runtime. Keep uploaded media on object storage or a persistent volume, not an ephemeral deployment directory.
