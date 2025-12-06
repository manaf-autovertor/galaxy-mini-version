# Deployment Guide

Complete guide to deploying the Query Mobile App to production.

## Pre-Deployment Checklist

✅ All features tested locally  
✅ Real-time messaging working  
✅ Authentication tested  
✅ Environment variables prepared  
✅ Production API URL ready  
✅ SSL certificates configured  
✅ Reverb/WebSocket tested on production Laravel  

---

## Option 1: Deploy to Netlify (Recommended)

### Step 1: Build the App

```bash
npm run build
```

### Step 2: Create Netlify Account

1. Go to https://netlify.com
2. Sign up or login with GitHub

### Step 3: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Step 4: Configure Environment Variables

In Netlify Dashboard:
1. Go to Site Settings → Environment Variables
2. Add these variables:
   ```
   VITE_API_BASE_URL=https://your-production-api.com
   VITE_REVERB_APP_KEY=your-production-key
   VITE_REVERB_HOST=your-production-host.com
   VITE_REVERB_PORT=443
   VITE_REVERB_SCHEME=https
   ```

### Step 5: Configure Redirects

Create `public/_redirects` file:
```
/*    /index.html   200
```

This ensures React Router works properly.

---

## Option 2: Deploy to Vercel

### Step 1: Build the App

```bash
npm run build
```

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 3: Deploy

```bash
vercel --prod
```

### Step 4: Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add production variables (same as Netlify above)

### Step 5: Configure Rewrites

Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Option 3: Deploy to AWS S3 + CloudFront

### Step 1: Build the App

```bash
npm run build
```

### Step 2: Create S3 Bucket

```bash
aws s3 mb s3://query-mobile-app
```

### Step 3: Configure Bucket for Static Hosting

```bash
aws s3 website s3://query-mobile-app \
  --index-document index.html \
  --error-document index.html
```

### Step 4: Upload Files

```bash
aws s3 sync dist/ s3://query-mobile-app --delete
```

### Step 5: Create CloudFront Distribution

1. Go to AWS CloudFront Console
2. Create new distribution
3. Set origin to S3 bucket
4. Configure custom error pages (404 → /index.html)
5. Set up SSL certificate

---

## Option 4: Deploy to Your Own Server

### Step 1: Build the App

```bash
npm run build
```

### Step 2: Upload to Server

```bash
# Using SCP
scp -r dist/* user@your-server:/var/www/query-app/

# Or using SFTP client like FileZilla
```

### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/query-app`:

```nginx
server {
    listen 80;
    server_name query-app.yourcompany.com;
    
    root /var/www/query-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Step 4: Enable SSL with Let's Encrypt

```bash
sudo certbot --nginx -d query-app.yourcompany.com
```

### Step 5: Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Environment-Specific Builds

### Development
```bash
npm run dev
```

### Staging
```bash
# Create .env.staging
VITE_API_BASE_URL=https://staging-api.com
VITE_REVERB_APP_KEY=staging-key
...

# Build with staging env
cp .env.staging .env
npm run build
```

### Production
```bash
# Create .env.production
VITE_API_BASE_URL=https://api.yourcompany.com
VITE_REVERB_APP_KEY=production-key
...

# Build with production env
cp .env.production .env
npm run build
```

---

## Post-Deployment Configuration

### 1. Update Laravel CORS

In `config/cors.php`:
```php
'allowed_origins' => [
    'https://query-app.yourcompany.com',
],
```

### 2. Update Sanctum Stateful Domains

In `config/sanctum.php`:
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 
    'query-app.yourcompany.com'
)),
```

### 3. Configure Reverb for Production

Ensure Reverb is accessible:
- Running on production server
- SSL configured
- Firewall allows WebSocket connections
- CORS configured properly

### 4. Test Production Deployment

1. Open production URL
2. Login with test credentials
3. Check WebSocket connection in browser console
4. Send test message
5. Verify real-time updates work
6. Test on multiple devices

---

## Performance Optimization

### 1. Enable Compression

Most hosting providers enable this automatically, but verify:

**Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. Optimize Images

Before deployment:
```bash
npm install -g imagemin-cli
imagemin public/images/* --out-dir=public/images
```

### 3. Code Splitting

Already handled by Vite, but you can add route-based splitting:

```javascript
// In App.jsx
import { lazy, Suspense } from 'react';

const QueryList = lazy(() => import('./pages/QueryList'));
const ChatWindow = lazy(() => import('./pages/ChatWindow'));

// Wrap routes in Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    ...
  </Routes>
</Suspense>
```

### 4. Service Worker (PWA)

Install Vite PWA plugin:
```bash
npm install vite-plugin-pwa -D
```

Update `vite.config.js`:
```javascript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Query Chat',
        short_name: 'Query',
        theme_color: '#f97316',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
```

---

## Monitoring & Analytics

### 1. Add Error Tracking (Sentry)

```bash
npm install @sentry/react
```

In `main.jsx`:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

### 2. Add Analytics (Google Analytics)

```bash
npm install react-ga4
```

In `App.jsx`:
```javascript
import ReactGA from 'react-ga4';

useEffect(() => {
  ReactGA.initialize('G-XXXXXXXXXX');
}, []);
```

---

## Rollback Strategy

If deployment fails:

### Quick Rollback
```bash
# Netlify
netlify rollback

# Vercel
vercel rollback

# Manual
# Keep previous dist folder
mv dist dist-backup
mv dist-previous dist
# Re-upload
```

---

## Automated Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_REVERB_APP_KEY: ${{ secrets.VITE_REVERB_APP_KEY }}
          VITE_REVERB_HOST: ${{ secrets.VITE_REVERB_HOST }}
          
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Set secure CORS policies
3. ✅ Implement rate limiting on API
4. ✅ Use environment variables for secrets
5. ✅ Enable CSP headers
6. ✅ Regular dependency updates
7. ✅ Implement proper authentication token expiry
8. ✅ Log and monitor security events

---

## Support Checklist

After deployment:
- [ ] Production URL accessible
- [ ] Login works
- [ ] WebSocket connects
- [ ] Real-time messaging works
- [ ] File uploads work
- [ ] Notifications display
- [ ] Mobile responsive
- [ ] Performance is good (< 3s load time)
- [ ] No console errors
- [ ] Analytics tracking
- [ ] Error monitoring setup

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Review performance metrics
- Test critical paths

**Monthly:**
- Update dependencies
- Security patches
- Performance optimization

**Quarterly:**
- Major updates
- Feature additions
- UX improvements

---

## Need Help?

- Check deployment logs for errors
- Test locally with production env variables
- Verify Laravel backend is accessible
- Check Reverb WebSocket connection
- Review CORS and authentication settings

Happy Deploying! 🚀
