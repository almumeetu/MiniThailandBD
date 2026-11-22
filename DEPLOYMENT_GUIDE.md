# 🚀 Mini Thailand BD Production Deployment Guide

This guide details the complete deployment steps for both **MiniThailandBD** (Next.js 16 Storefront & Admin Portal) and **api-minithiland** (NestJS REST API Backend).

---

## 🏗️ Architecture Overview

- **Frontend (`MiniThailandBD`)**: Next.js 16 (App Router), Tailwind CSS v4, Lucide/React Icons, Recharts, Sonner. Runs on port `3002`.
- **Backend (`api-minithiland`)**: NestJS, Prisma ORM, PostgreSQL database, JWT Auth, Swagger API docs, Multer/Local media storage. Runs on port `5010`.
- **Nginx Reverse Proxy**: Directs web traffic to Next.js on port `3002` and API/media requests to NestJS on port `5010`.

---

## ⚡ Quick Deployment with PM2 (Recommended)

From the project root (`Ecommerce-MiniThailand`):

```bash
# 1. Install dependencies for both apps
cd api-minithiland && npm install && npx prisma generate && cd ..
cd MiniThailandBD && npm install && cd ..

# 2. Build backend and frontend
cd api-minithiland && npm run build && cd ..
cd MiniThailandBD && npm run build && cd ..

# 3. Run database migrations safely
cd api-minithiland && npx prisma migrate deploy && cd ..

# 4. Start all applications with root ecosystem config
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📋 Environment Variables Checklist

### 1. Frontend (`MiniThailandBD/.env`)

```env
# Production API URL (NestJS backend API)
NEXT_PUBLIC_API_BASE_URL="https://api.minithailandbd.com/api/v1"
API_BASE_URL="http://127.0.0.1:5010/api/v1"
NEXT_PUBLIC_APP_URL="https://minithailandbd.com"
NEXT_PUBLIC_MEDIA_BASE_URL="https://api.minithailandbd.com"

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"

# Email Service (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="orders@minithailandbd.com"
RESEND_TO_EMAIL="orders@minithailandbd.com"

# Shop Branding & SEO
SHOP_NAME="Mini Thailand"
SHOP_DESCRIPTION="Exclusive Thai Cord Sets, Luxury Party Gowns, Dubai Abayas & Velvet Boutique Fashion in Bangladesh"
NEXT_PUBLIC_SITE_URL="https://minithailandbd.com"
PORT=3002
```

### 2. Backend (`api-minithiland/.env`)

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/minithailand?schema=public"

# Application Configuration
PORT=5010
NODE_ENV=production
BASE_URL="https://api.minithailandbd.com"
FRONTEND_URL="https://minithailandbd.com"

# JWT Authentication
JWT_SECRET="generate-a-strong-32-char-random-jwt-secret-for-production"
JWT_EXPIRES_IN=7d

# Storage
STORAGE_PROVIDER=local

# bKash Payment (Production or Sandbox)
BKASH_BASE_URL="https://tokenized.pay.bka.sh/v1.2.0-beta"
BKASH_USERNAME="your_bkash_username"
BKASH_PASSWORD="your_bkash_password"
BKASH_APP_KEY="your_bkash_app_key"
BKASH_APP_SECRET="your_bkash_app_secret"
BKASH_CALLBACK_URL="https://api.minithailandbd.com/api/v1/payments/bkash/callback"
```

---

## 🔒 Admin & Store Dashboard Verification

| Dashboard Area | Route | Access |
|---|---|---|
| **Admin Dashboard** | `/admin/dashboard` | Protected (Admin/Staff role) |
| **Admin Login** | `/admin/login` | Public (Vendor/Admin login form) |
| **Catalog & Products** | `/admin/products` | Manage products, inventory, media, variants |
| **POS System** | `/admin/pos` | In-store billing, receipt generation, checkout |
| **Order Management** | `/admin/orders` | Update status, shipping tracking, invoice print |
| **Reports & Analytics** | `/admin/reports` | Sales, customer, discount breakdowns |
| **Hero & Campaigns** | `/admin/settings/campaigns` | Sliders, banners, promotional campaign items |
| **Videos / Reels** | `/admin/videos` | Watch & shop video integration |
| **Customer Profile** | `/profile` | Customer orders, tracking, saved addresses, wishlist |
| **Track Order** | `/profile?tab=track` | Public guest tracking with order number |
| **Store Dashboard** | `/dashboard` | Intelligent redirect (Admin → `/admin/dashboard`, User → `/profile`) |

---

## 🌐 Sample Nginx Configuration

```nginx
# Frontend: minithailandbd.com
server {
    server_name minithailandbd.com www.minithailandbd.com;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend: api.minithailandbd.com
server {
    server_name api.minithailandbd.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
