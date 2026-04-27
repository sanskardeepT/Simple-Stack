# SimpleStack

SimpleStack is a headless CMS SaaS for developers and small businesses who want to manage website content without shipping code changes for every update. It combines a React app, an Express API, subscriptions, media management, public content delivery, and a lightweight connect SDK in one monorepo.

## Tech Stack

- Backend: Node.js, Express 5, TypeScript, MongoDB, Mongoose
- Cache and queues: Redis, BullMQ
- Frontend: React 18, Vite, TypeScript, Zustand, React Query, React Router
- Payments: Razorpay
- Media: Cloudinary
- Messaging: Resend, MSG91

## Local Development Setup

### Prerequisites

- Node.js 20+
- MongoDB running locally or reachable via connection string
- Redis running locally on `127.0.0.1:6379`

### Steps

1. Clone the repository.
2. Install dependencies:

```bash
npm run install:all
```

3. Review and update local environment files:

- `backend/.env`
- `frontend/.env`

4. Start backend and frontend together:

```bash
npm run dev
```

5. Open the frontend at `http://localhost:5173`.

In development, OTP delivery falls back to backend terminal logs when provider keys are not configured, so you can complete register and verify flows locally.

## Environment Variables

### Backend

| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | Yes | `development`, `test`, or `production` |
| `PORT` | Yes | Backend port |
| `LOG_LEVEL` | Yes | `debug`, `info`, `warn`, `error` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `REDIS_URL` | Yes | Local Redis or Upstash `rediss://...` URL |
| `JWT_ACCESS_SECRET` | Yes | Minimum 32 chars |
| `JWT_REFRESH_SECRET` | Yes | Minimum 32 chars |
| `JWT_ACCESS_EXPIRES` | Yes | Example: `15m` |
| `JWT_REFRESH_EXPIRES` | Yes | Example: `7d` |
| `RESEND_API_KEY` | Optional | Needed for real email OTP delivery |
| `MSG91_API_KEY` | Optional | Needed for real SMS OTP delivery |
| `MSG91_SENDER_ID` | Optional | Needed for MSG91 SMS sender identity |
| `SUPERADMIN_EMAIL` | Yes | Seeded superadmin email on first boot |
| `COUPON_CODE` | Yes | Defaults to `SANSKARDEEP` |
| `RAZORPAY_KEY_ID` | Optional | Needed for live subscription checkout |
| `RAZORPAY_KEY_SECRET` | Optional | Needed for live subscription checkout |
| `RAZORPAY_PLAN_ID` | Optional | Razorpay recurring plan ID |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Used to verify Razorpay webhooks |
| `CLOUDINARY_CLOUD_NAME` | Optional | Needed for hosted media uploads |
| `CLOUDINARY_API_KEY` | Optional | Needed for hosted media uploads |
| `CLOUDINARY_API_SECRET` | Optional | Needed for hosted media uploads |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins |
| `AWS_S3_BUCKET` | Optional | Reserved for S3-based media/storage use |
| `AWS_ACCESS_KEY_ID` | Optional | Reserved for S3-based media/storage use |
| `AWS_SECRET_ACCESS_KEY` | Optional | Reserved for S3-based media/storage use |
| `AWS_REGION` | Optional | Reserved for S3-based media/storage use |

### Frontend

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Example: `http://localhost:3000/api/v1` |

## Admin Access

On first backend boot, SimpleStack checks whether a `superadmin` user already exists. If none exists, it seeds one automatically using `SUPERADMIN_EMAIL`, marks email as verified, and logs the email in the backend terminal so the founder can use a password reset flow or manually set credentials.

## Deployment (Render)

### Backend

- Deploy `backend` as a Render Web Service.
- Set all backend environment variables in Render.
- Ensure MongoDB and Redis/Upstash are reachable from the service.
- Health check path: `/health`
- A ready-to-import Render blueprint is included at `render.yaml`.

### Frontend

- Deploy `frontend` as a Static Site.
- Build with the frontend workspace config used in the repo.
- Point `VITE_API_BASE_URL` to your deployed backend, for example `https://api.yourdomain.com/api/v1`.
- If serving the built frontend with Nginx, keep SPA fallback enabled.
- For Vercel, `frontend/vercel.json` already includes the SPA rewrite to `index.html`.

## Coupon System

The coupon code `SANSKARDEEP` grants lifetime free access by activating the subscription without an expiry date. Paid subscriptions continue to use the regular Razorpay-backed monthly plan flow.

## connect.js SDK

Embed SimpleStack content on any connected website with:

```html
<script src="https://cdn.simplestack.in/connect.js" data-project="PROJECT_ID"></script>
```

The SDK resolves its API base dynamically unless you override it with `data-api-base`.
