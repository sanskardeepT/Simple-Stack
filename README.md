# 🚀 SimpleStack

SimpleStack is a modern headless CMS SaaS platform built for developers, startups, agencies, and small businesses that want complete control over website content without redeploying code for every small update.

It combines a powerful API backend, scalable content delivery system, media management, authentication, subscriptions, and an embeddable SDK into one developer-focused platform.

Unlike traditional CMS platforms that feel bloated and restrictive, SimpleStack focuses on speed, flexibility, clean architecture, and easy integration with modern frontend frameworks.

---

# ✨ What SimpleStack Does

SimpleStack allows teams to:

* Manage website content visually
* Deliver content through APIs
* Upload and manage media assets
* Handle subscriptions and billing
* Embed dynamic content into any website
* Connect frontend apps without backend complexity

The platform is designed to work seamlessly with:

* React
* Next.js
* Vite
* Static websites
* Custom frontend stacks
* Mobile apps

---

# 🎯 Key Features

## 🧠 Headless CMS Architecture

SimpleStack follows a headless-first architecture where:

* Content lives in the backend
* APIs deliver structured data
* Frontends remain completely independent

This makes deployments faster, cleaner, and more scalable.

---

## ⚡ Real-Time Content Management

Update website content instantly without:

* Rebuilding frontend apps
* Touching production code
* Redeploying servers

Perfect for:

* Landing pages
* Blogs
* Startup websites
* Product catalogs
* Marketing sections
* Dynamic UI content

---

## 🖼️ Media Management

Built-in media handling powered by Cloudinary:

* Image uploads
* Optimized delivery
* CDN support
* Hosted asset management
* Scalable storage support

Future-ready AWS S3 integration is also included.

---

## 💳 Subscription & Billing System

Integrated Razorpay recurring subscription flow:

* Monthly plans
* Webhook verification
* Subscription activation
* Coupon support
* Lifetime access system

The platform includes a special coupon system for founder/admin-level activation.

---

## 🔐 Authentication & OTP System

Secure authentication flows with:

* JWT access tokens
* Refresh token rotation
* Email OTP verification
* SMS OTP verification
* Role-based access control

OTP delivery works even during local development by logging codes directly in the backend terminal when provider APIs are not configured.

---

## 📡 Embedded connect.js SDK

SimpleStack provides a lightweight SDK that allows developers to embed managed content into any website using a single script tag.

```html
<script 
  src="https://cdn.simplestack.in/connect.js" 
  data-project="PROJECT_ID">
</script>
```

The SDK automatically resolves the correct API base unless overridden manually.

---

# 🛠️ Tech Stack

## Backend

* Node.js
* Express 5
* TypeScript
* MongoDB
* Mongoose

## Frontend

* React 18
* Vite
* TypeScript
* Zustand
* React Query
* React Router

## Infrastructure

* Redis
* BullMQ
* Docker
* Render Deployment

## Integrations

* Razorpay
* Cloudinary
* Resend
* MSG91

---

# 📂 Monorepo Structure

```bash
simplestack/
│
├── backend/
├── frontend/
├── packages/
├── scripts/
├── docker/
└── render.yaml
```

---

# ⚡ Local Development Setup

## Prerequisites

Before starting, ensure the following are installed:

* Node.js 20+
* MongoDB
* Redis

Redis should run locally on:

```bash
127.0.0.1:6379
```

---

# 🚀 Getting Started

## 1️⃣ Clone Repository

```bash
git clone <your-repository-url>
cd simplestack
```

---

## 2️⃣ Install Dependencies

```bash
npm run install:all
```

---

## 3️⃣ Configure Environment Variables

Update:

```bash
backend/.env
frontend/.env
```

with your local configuration.

---

## 4️⃣ Start Development Servers

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🔐 Backend Environment Variables

| Variable              | Required | Purpose                   |
| --------------------- | -------- | ------------------------- |
| NODE_ENV              | Yes      | development / production  |
| PORT                  | Yes      | Backend server port       |
| LOG_LEVEL             | Yes      | Logging level             |
| MONGODB_URI           | Yes      | MongoDB connection string |
| REDIS_URL             | Yes      | Redis connection          |
| JWT_ACCESS_SECRET     | Yes      | Access token secret       |
| JWT_REFRESH_SECRET    | Yes      | Refresh token secret      |
| RESEND_API_KEY        | Optional | Email OTP delivery        |
| MSG91_API_KEY         | Optional | SMS OTP delivery          |
| RAZORPAY_KEY_ID       | Optional | Razorpay integration      |
| CLOUDINARY_CLOUD_NAME | Optional | Media upload support      |
| ALLOWED_ORIGINS       | Yes      | CORS configuration        |

---

# 🌐 Frontend Environment Variables

| Variable          | Required | Purpose         |
| ----------------- | -------- | --------------- |
| VITE_API_BASE_URL | Yes      | Backend API URL |

Example:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

# 👑 Superadmin Bootstrap System

On the first backend startup:

* SimpleStack checks for an existing superadmin
* If none exists, it automatically seeds one
* Email verification is bypassed for founder access
* Credentials are logged securely in backend logs

This makes initial platform setup extremely fast during deployment.

---

# 💳 Coupon & Subscription Logic

SimpleStack supports:

* Monthly recurring subscriptions
* Lifetime access coupons
* Promotional onboarding flows

Default founder coupon:

```bash
SANSKARDEEP
```

This coupon activates unlimited lifetime access without subscription expiry.

---

# ☁️ Deployment Guide

## Backend Deployment (Render)

Deploy backend as:

* Render Web Service

Required steps:

* Configure environment variables
* Connect MongoDB
* Connect Redis / Upstash
* Set health check path:

```bash
/health
```

A production-ready:

```bash
render.yaml
```

is already included in the repository.

---

## Frontend Deployment

Deploy frontend as:

* Static Site
* Vercel App
* Nginx Build

Update:

```bash
VITE_API_BASE_URL
```

to point to the deployed backend API.

Example:

```bash
https://api.yourdomain.com/api/v1
```

---

# 🔄 SPA Routing Support

For frontend hosting:

* Vercel rewrite rules are preconfigured
* Nginx SPA fallback is supported
* React Router deep links work correctly

---

# 📈 Why SimpleStack Is Different

Most CMS platforms are either:

* Too complex
* Too expensive
* Too slow
* Too restrictive for developers

SimpleStack focuses on:

✅ Clean architecture
✅ Developer-first workflows
✅ Fast API delivery
✅ Simple integrations
✅ Scalable infrastructure
✅ SaaS-ready monetization
✅ Modern frontend compatibility

---

# 🧠 Future Roadmap

Planned platform upgrades include:

* Visual page builder
* Multi-tenant workspaces
* AI-assisted content generation
* Analytics dashboard
* API rate limiting
* GraphQL support
* Team collaboration tools
* Edge CDN delivery
* Real-time collaborative editing
* Marketplace plugins

---

# 📌 Vision

The vision behind SimpleStack is to build a lightweight, scalable, developer-friendly CMS ecosystem that removes the pain of traditional content management systems.

The goal is simple:

> Build content once. Deliver it anywhere.

---

# 📄 License

This project is intended for educational, SaaS, and production-ready development purposes.

---

# ⭐ Support & Contribution

If you found this project useful:

* Star the repository
* Fork the project
* Open pull requests
* Suggest improvements
* Share feedback

Modern websites deserve modern content infrastructure 🚀
