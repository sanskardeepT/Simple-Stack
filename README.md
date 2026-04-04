# Simple Stack

Simple Stack is a production-oriented SaaS CMS built with a split TypeScript frontend and backend architecture. It includes JWT auth with refresh-token rotation, Redis-backed caching, BullMQ background jobs, analytics dashboards, role-based access control, media uploads, and Docker-based deployment workflows.

## Stack

### Backend
- Node.js
- Express 5
- TypeScript
- Mongoose
- MongoDB
- Redis (`ioredis`)
- BullMQ
- Winston

### Frontend
- React 18
- Vite
- TypeScript
- React Router v6
- React Query
- Zustand
- React Hook Form
- Zod
- Recharts

### Infra
- Docker
- Nginx
- PM2
- GitHub Actions

## Features

- Role-based CMS access for `admin`, `editor`, and `viewer`
- Access-token plus refresh-token auth flow with token-family rotation
- Content type builder for structured CMS models
- Entry CRUD with search, pagination, cache, soft-delete, and related-content lookup
- Media upload pipeline with local storage or S3-backed storage
- Redis caching for read-heavy entry and analytics endpoints
- BullMQ queues for analytics and media processing jobs
- Analytics dashboard with trending content, activity feed, and views-over-time charts
- Admin user management for role and active-state updates
- Docker, CI/CD, and PM2 production deployment scaffolding

## Project Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── jobs/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── modules/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── Dockerfile
│   └── ecosystem.config.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── router/
│   │   ├── schemas/
│   │   └── types/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
└── .github/workflows/ci.yml
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment files

Backend:

```bash
cp backend/.env.example backend/.env.development
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

### 3. Start the full stack locally

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:3000`.

## Docker

### Development

```bash
docker compose up
```

### Production-style compose

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## Scripts

Root:

```bash
npm run dev
npm run lint
npm run type-check
npm run build
npm test
```

Package-level:

```bash
npm run dev -w backend
npm run dev -w frontend
npm run build -w backend
npm run build -w frontend
```

## Environment Variables

### Backend required

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES`
- `JWT_REFRESH_EXPIRES`
- `ALLOWED_ORIGINS`
- `LOG_LEVEL`

### Backend optional

- `AWS_S3_BUCKET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

### Frontend required

- `VITE_API_URL`

## API Overview

All backend routes are mounted under `/api/v1`.

### Main route groups

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/content-types`
- `/api/v1/entries`
- `/api/v1/media`
- `/api/v1/analytics`

## Deployment Notes

- Backend health endpoint: `/health`
- Frontend Nginx config supports SPA routing and `/api/` proxying
- PM2 config is included at `backend/ecosystem.config.js`
- GitHub Actions workflow includes test, image build/push, and deploy-hook stages

## Verification Completed

The current app revision has been verified with:

- `npm run type-check`
- `npm run lint`
- `npm run build -w backend`
- `npm run build -w frontend`
- `npm test`
