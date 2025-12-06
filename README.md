# 🚀 Query Mobile App

> A production-ready, mobile-first React application for real-time query management, perfectly integrated with your Laravel backend and Reverb WebSocket server.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.1-purple.svg)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

**[Quick Start](#-quick-installation)** | **[Features](#-features)** | **[Documentation](#-documentation)** | **[Support](#-support)**

---

## 📱 What Is This?

A **WhatsApp-like mobile chat interface** that connects to your existing Laravel query system, providing real-time messaging, file uploads, and beautiful mobile-first UX.

## Features

- 🔐 **Laravel Sanctum Authentication** - Secure token-based authentication
- 💬 **Real-time Chat** - Live messaging with Laravel Reverb/Pusher
- 📱 **Mobile-First Design** - WhatsApp-like interface optimized for mobile
- 🎨 **Modern UI** - Tailwind CSS with gradients, shadows, and smooth animations
- 🔔 **Push Notifications** - Real-time updates with sound notifications
- 📎 **File Attachments** - Support for document uploads
- 🏷️ **Query Management** - Organize queries by tabs (Raised to You, Raised by You)
- ⚡ **Status Tracking** - Pending, Reverted, and Closed states

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Zustand** - State management
- **Axios** - HTTP client
- **Laravel Echo** - WebSocket client
- **Pusher.js** - Real-time communication
- **Tailwind CSS** - Styling
- **date-fns** - Date formatting
- **Lucide React** - Icons

## Prerequisites

- Node.js 18+ and npm
- Laravel backend with Reverb configured
- Access to Laravel API endpoints

## Installation

1. **Clone/Create the project:**
   ```bash
   cd query-mobile-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update the values:
     ```env
     VITE_API_BASE_URL=https://los.dev.autovert.in
     VITE_REVERB_APP_KEY=your-app-key
     VITE_REVERB_HOST=los.dev.autovert.in
     VITE_REVERB_PORT=443
     VITE_REVERB_SCHEME=https
     ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## Project Structure

```
query-mobile-app/
├── src/
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Login page
│   │   ├── QueryList.jsx   # Query list with tabs
│   │   └── ChatWindow.jsx  # Chat interface
│   ├── services/           # API services
│   │   ├── api.js          # Axios instance
│   │   ├── authService.js  # Authentication
│   │   ├── queryService.js # Query operations
│   │   └── echoService.js  # WebSocket/Reverb
│   ├── store/              # State management
│   │   ├── authStore.js    # Auth state
│   │   └── queryStore.js   # Query state
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/
│   └── sounds/
│       └── bell.mp3        # Notification sound
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Laravel Backend Requirements

Your Laravel backend needs to provide these API endpoints:

### Authentication
- `POST /api/login` - Login with email/password
- `POST /api/logout` - Logout
- `GET /api/user` - Get current user

### Queries
- `GET /api/queries` - List queries (with filters)
- `GET /api/queries/counts` - Get query counts
- `GET /api/queries/{id}` - Get single query
- `GET /api/queries/{id}/messages` - Get messages
- `POST /api/queries/{id}/messages` - Send message
- `POST /api/queries/{id}/documents` - Upload document
- `POST /api/queries/{id}/close` - Close query
- `PATCH /api/queries/{id}/status` - Update status
- `POST /api/queries/{id}/participants` - Add participant

### WebSocket
- Reverb/Pusher configured for presence channels
- Channel: `user.{userId}` (presence channel)
- Event: `SendUpdate` with payload:
  ```json
  {
    "type": "QUERY_MESSAGE" | "QUERY_MESSAGE_CLOSED",
    "query_id": 123,
    "message": "New message",
    "data": {...}
  }
  ```

## Real-time Communication

The app uses Laravel Echo with Reverb to provide real-time updates:

1. **Connection**: Established on login with Bearer token
2. **Channel**: Joins presence channel `user.{userId}`
3. **Events**: Listens for `SendUpdate` events
4. **Updates**: Automatically updates UI and plays notification sound

## Mobile Optimization

- Touch-friendly large tap targets
- Safe area insets for notched devices
- Smooth scrolling and animations
- Optimized bundle size
- PWA-ready structure

## Styling Conventions

- **Primary Color**: Orange to Amber gradient
- **Font**: Inter (loaded from Google Fonts)
- **Border Radius**: Generous use of rounded corners (12px-24px)
- **Shadows**: Soft, layered shadows for depth
- **Animations**: Smooth transitions (200-300ms)

## Common Issues

### WebSocket Not Connecting
- Verify Reverb is running on Laravel backend
- Check VITE_REVERB_* environment variables
- Ensure SSL/TLS is configured for production

### Authentication Errors
- Confirm Laravel Sanctum is configured
- Check CORS settings in Laravel
- Verify API_BASE_URL is correct

### Messages Not Updating
- Check Echo connection in browser console
- Verify presence channel subscription
- Ensure SendUpdate event is being broadcast

## Development Tips

1. **Hot Module Replacement**: Vite provides instant HMR during development
2. **State Debugging**: Use React DevTools and check Zustand store
3. **Network Inspection**: Use browser DevTools to inspect API calls
4. **Console Logs**: Echo events are logged to console for debugging

## License

This project is proprietary software for Autovert.

## Support

For issues or questions, contact the development team.
