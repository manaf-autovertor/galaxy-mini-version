# Quick Start Guide

Get the Query Mobile App running in 5 minutes!

## Prerequisites

✅ Node.js 18+ installed  
✅ npm installed  
✅ Laravel backend with Reverb running  
✅ Access to API endpoints  

## Step 1: Install Dependencies

Open terminal in the `query-mobile-app` folder:

```bash
npm install
```

This will install all required packages including React, Laravel Echo, Pusher, Tailwind CSS, etc.

## Step 2: Configure Environment

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and update these values:

   ```env
   VITE_API_BASE_URL=https://los.dev.autovert.in
   VITE_REVERB_APP_KEY=your-app-key-here
   VITE_REVERB_HOST=los.dev.autovert.in
   VITE_REVERB_PORT=443
   VITE_REVERB_SCHEME=https
   ```

   **Where to find these values:**
   - `VITE_API_BASE_URL`: Your Laravel application URL
   - `VITE_REVERB_APP_KEY`: Check Laravel `.env` → `REVERB_APP_KEY`
   - `VITE_REVERB_HOST`: Your Laravel domain (without https://)
   - `VITE_REVERB_PORT`: Usually 443 for HTTPS, 80 for HTTP
   - `VITE_REVERB_SCHEME`: `https` or `http`

## Step 3: Copy Notification Sound (Optional)

Copy the notification sound from your Laravel app:

```bash
# From Laravel public/sounds/bell.mp3
# To React app public/sounds/bell.mp3
```

Or skip this - the app will work without it.

## Step 4: Start Development Server

```bash
npm run dev
```

You should see:

```
  VITE v5.1.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

## Step 5: Open and Test

1. **Open in browser:** http://localhost:3000
2. **Login** with your Laravel credentials
3. **View queries** in the WhatsApp-like interface
4. **Click a query** to open chat
5. **Send a message** and watch it appear in real-time!

## Testing Real-Time Features

### Test 1: Self-Messaging
1. Login on mobile app
2. Login on Laravel web app (same user)
3. Send message from Laravel web
4. See it appear instantly on mobile!

### Test 2: Multi-User
1. Login as User A on mobile
2. Login as User B on Laravel web
3. User B sends message to User A's query
4. User A sees it instantly + hears notification sound!

## Common Issues & Fixes

### Issue: "Cannot connect to API"
**Fix:** Check `VITE_API_BASE_URL` is correct and Laravel is running

### Issue: "Login failed"
**Fix:** Ensure Laravel Sanctum is configured and CORS allows your React app origin

### Issue: "WebSocket connection failed"
**Fix:** 
- Check Reverb is running: `php artisan reverb:start`
- Verify `VITE_REVERB_*` values match Laravel `.env`
- Check Laravel logs for errors

### Issue: "Messages not updating in real-time"
**Fix:**
- Open browser console and check for Echo connection logs
- Verify you see: "Presence channel connected"
- Check Laravel is broadcasting events (check logs)

### Issue: "Blank white screen"
**Fix:**
- Open browser console for error messages
- Check all environment variables are set
- Verify npm install completed successfully

## Mobile Testing

### Test on Real Mobile Device

1. **Find your IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Access from mobile:**
   Open browser on phone and go to:
   ```
   http://YOUR-IP-ADDRESS:3000
   ```
   Example: `http://192.168.1.100:3000`

3. **Ensure same network:**
   Your phone and computer must be on the same WiFi network

### Test with Browser DevTools

1. Open Chrome DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Select a mobile device (iPhone, Android)
4. Test the interface as if on mobile

## Production Build

When ready for production:

```bash
npm run build
```

Output will be in `dist/` folder. Deploy this to any static hosting:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Your own web server

## Next Steps

✅ Customize colors in `tailwind.config.js`  
✅ Add more features (search, filters, etc.)  
✅ Set up PWA for offline support  
✅ Add push notifications  
✅ Implement file preview  

## Need Help?

Check these files:
- `README.md` - Complete documentation
- `LARAVEL_SETUP.md` - Backend setup guide
- `src/` - Browse the source code

## Happy Coding! 🚀

Your mobile query chat app is ready to use. Start chatting in real-time!
