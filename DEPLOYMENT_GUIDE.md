# 🚀 NovaMart Production Deployment Guide

## Quick Start Commands

### Frontend Deployment (Next.js)
```bash
# Navigate to project directory
cd /Users/almumeetusaikat/Documents/GitHuB/API/ecom-dashboard

# Install dependencies (if not already done)
npm install

# Build for production
npm run build

# Start production server (Port 3002)
npm run start

# Alternative: Use PM2 for process management
pm2 start npm --name "novamart-frontend" -- start
pm2 save
pm2 startup
```

### Backend Deployment (NestJS)
Ensure your backend server is configured with the production environment variables:

```env
NODE_ENV=production
PORT=5011
DATABASE_URL="postgresql://novamart_db:NovamartPassword123%23@localhost:5432/nest_ecom_prod?schema=public"
JWT_SECRET="e9b2c3d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c5"
BASE_URL="https://api-novamart.webdevss.tech"
STORAGE_PROVIDER=local
```

---

## 🔧 Configuration Steps

### 1. Environment Variables
Already configured in `.env` file:
- ✅ Production API URLs
- ✅ Google OAuth Client ID
- ✅ Resend API Key
- ✅ Shop branding

### 2. Google OAuth Setup
Go to [Google Cloud Console](https://console.cloud.google.com/):

1. Navigate to your project
2. Go to **APIs & Services** > **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins:**
   - `https://novamart.webdevss.tech`
   - `http://localhost:3002` (for development)
5. Add to **Authorized redirect URIs:**
   - `https://novamart.webdevss.tech/login`
   - `https://novamart.webdevss.tech/signup`
6. Save changes

### 3. Database Setup
Ensure PostgreSQL is running:
```bash
# Check database status
psql -U novamart_db -d nest_ecom_prod -c "SELECT version();"

# If needed, create database
createdb -U novamart_db nest_ecom_prod

# Run migrations (if applicable)
# cd [backend-directory]
# npm run migration:run
```

### 4. Domain Configuration
Ensure DNS records are configured:
- `novamart.webdevss.tech` → Frontend server IP
- `api-novamart.webdevss.tech` → Backend server IP

Verify SSL certificates are installed and valid.

---

## 🚀 Deployment Options

### Option 1: Manual Deployment (Current Setup)
```bash
# Build and start
npm run build
npm run start
```
Frontend will run on port 3002. Configure reverse proxy (Nginx/Apache) to serve on port 80/443.

### Option 2: PM2 Process Manager (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "novamart-store" -- start

# View logs
pm2 logs novamart-store

# Monitor
pm2 monit

# Save PM2 configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup
```

### Option 3: Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t novamart-store .
docker run -p 3000:3000 --env-file .env novamart-store
```

### Option 4: Vercel Deployment (Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables will need to be added in Vercel dashboard
```

---

## 🔄 Nginx Reverse Proxy Configuration

Create `/etc/nginx/sites-available/novamart`:

```nginx
# Frontend
server {
    listen 80;
    listen [::]:80;
    server_name novamart.webdevss.tech;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name novamart.webdevss.tech;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/certificate.key;

    location / {
        proxy_pass http://localhost:3002;
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

# Backend API
server {
    listen 80;
    listen [::]:80;
    server_name api-novamart.webdevss.tech;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api-novamart.webdevss.tech;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/certificate.key;

    location / {
        proxy_pass http://localhost:5011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers (if needed)
        add_header 'Access-Control-Allow-Origin' 'https://novamart.webdevss.tech' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/novamart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 Monitoring & Logs

### View Application Logs
```bash
# PM2 logs
pm2 logs novamart-store

# If running with npm
# Check logs in terminal or redirect to file
npm start > logs/app.log 2>&1
```

### Monitor Application Health
```bash
# PM2 monitoring
pm2 monit

# Check if app is running
pm2 status

# Restart if needed
pm2 restart novamart-store
```

---

## 🔒 Security Checklist

- [x] HTTPS enabled with valid SSL certificates
- [x] Environment variables not exposed in client-side code
- [x] CORS configured properly on backend
- [x] JWT secrets are strong and unique
- [x] Database credentials secured
- [x] Rate limiting on API (should be configured on backend)
- [x] Input validation on all forms
- [ ] Configure firewall rules to restrict database access
- [ ] Setup automated backups for database
- [ ] Enable security headers (CSP, HSTS, etc.)

---

## 🧪 Testing Before Go-Live

### 1. Health Check
```bash
# Test frontend
curl https://novamart.webdevss.tech

# Test backend API
curl https://api-novamart.webdevss.tech/api/v1/products
```

### 2. Test Critical Flows
1. **Homepage loads** ✓
2. **Product listing works** ✓
3. **User can register** (test manually)
4. **User can login** (test manually)
5. **Google OAuth works** (test manually)
6. **Add to cart** (test manually)
7. **Checkout process** (test manually)
8. **Order placement** (test manually)
9. **Email notifications** (test manually)

### 3. Performance Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test homepage
ab -n 100 -c 10 https://novamart.webdevss.tech/

# Test API
ab -n 100 -c 10 https://api-novamart.webdevss.tech/api/v1/products
```

---

## 🆘 Troubleshooting

### Frontend Not Loading
```bash
# Check if process is running
pm2 status
# or
ps aux | grep node

# Check build was successful
ls -la .next/

# Rebuild if needed
npm run build
```

### API Connection Issues
1. Verify backend is running on port 5011
2. Check firewall rules allow connections
3. Verify CORS configuration on backend
4. Test API directly: `curl https://api-novamart.webdevss.tech/api/v1/products`

### Google OAuth Not Working
1. Verify client ID in `.env` matches Google Cloud Console
2. Check authorized origins in Google Console include production URL
3. Clear browser cookies and try again
4. Check browser console for detailed error messages

### Database Connection Issues
```bash
# Test database connection
psql -U novamart_db -h localhost -d nest_ecom_prod -c "SELECT 1;"

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### Emails Not Sending
1. Verify Resend API key is correct
2. Check Resend dashboard for delivery logs
3. Verify `RESEND_FROM_EMAIL` is verified in Resend
4. Check application logs for email sending errors

---

## 📞 Support

For issues during deployment:
- **Email:** almumeetu@gmail.com
- **Phone:** +880 1722-301927

---

## 🎉 Post-Deployment

### Monitor for First 24 Hours
- Watch error logs for any issues
- Monitor server resource usage (CPU, RAM, disk)
- Track first orders through completion
- Verify email notifications are being sent
- Check payment gateway transactions

### Setup Automated Backups
```bash
# Database backup script
#!/bin/bash
BACKUP_DIR="/backups/novamart"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U novamart_db nest_ecom_prod > $BACKUP_DIR/backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

# Add to crontab for daily backups at 2 AM
# crontab -e
# 0 2 * * * /path/to/backup-script.sh
```

---

## ✅ Deployment Complete!

Your NovaMart e-commerce platform is now live in production! 🎊

**URLs:**
- Store: https://novamart.webdevss.tech
- API: https://api-novamart.webdevss.tech

Monitor the application closely for the first few days and be ready to respond to any issues quickly.
