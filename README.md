# Query Mobile App - React Native

A production-ready React Native mobile application for real-time query management, built with Expo and integrated with Laravel backend.

## Features

- 🔐 **Laravel Sanctum Authentication** - Secure token-based authentication
- 💬 **Real-time Chat** - Live messaging with Laravel Reverb WebSocket
- 📱 **Native Mobile App** - Built with React Native and Expo
- 🎨 **Modern UI** - Beautiful native components with gradients and animations
- 🔔 **Push Notifications** - Real-time updates with notification support
- 📎 **File Attachments** - Upload documents with native file picker
- 🏷️ **Query Management** - Organize queries by tabs (Raised to You, Raised by You)
- ⚡ **Status Tracking** - Pending, Reverted, and Closed states

## Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Zustand** - State management
- **Axios** - HTTP client
- **Laravel Echo** - WebSocket client
- **Pusher.js** - Real-time communication
- **date-fns** - Date formatting
- **Expo Vector Icons** - Icon library

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- OR Expo Go app on your physical device
- Laravel backend with Reverb configured

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Update the values in `app.json` under `expo.extra`:
   ```json
   {
     "apiBaseUrl": "https://your-api-url.com",
     "reverbAppKey": "your-app-key",
     "reverbHost": "your-host.com",
     "reverbPort": "443",
     "reverbScheme": "https",
     "reverbPath": "/reverb-ws"
   }
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   - Press `i` for iOS simulator (Mac only)
   - Press `a` for Android emulator
   - OR scan the QR code with Expo Go app

## Project Structure

```
query-mobile-app/
├── App.js                  # Main app entry
├── index.js                # Root entry point
├── app.json                # Expo configuration
├── src/
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.js # Main navigator
│   ├── pages/              # Screen components
│   │   ├── Login.jsx       # Login screen
│   │   ├── Home.jsx        # Home dashboard
│   │   ├── QueryList.jsx   # Query list with filters
│   │   ├── ChatWindow.jsx  # Chat interface
│   │   ├── Profile.jsx     # User profile
│   │   └── AIAssistant.jsx # AI assistant
│   ├── components/         # Reusable components
│   │   ├── OfflineIndicator.jsx
│   │   └── PlaceholderPage.jsx
│   ├── services/           # API & WebSocket
│   │   ├── api.js          # Axios instance
│   │   ├── authService.js  # Auth API
│   │   ├── queryService.js # Query API
│   │   └── echoService.js  # WebSocket
│   └── store/              # State management
│       ├── authStore.js    # Auth state
│       └── queryStore.js   # Query state
└── assets/                 # Images, sounds, etc.
```

## Building for Production

### iOS (requires Mac)
```bash
npm run ios
eas build --platform ios
```

### Android
```bash
npm run android
eas build --platform android
```

## Environment Variables

Configure these in `app.json` under `expo.extra`:

- `apiBaseUrl` - Your Laravel API base URL
- `reverbAppKey` - Reverb application key
- `reverbHost` - Reverb WebSocket host
- `reverbPort` - Reverb port (usually 443)
- `reverbScheme` - http or https
- `reverbPath` - Reverb path (usually /reverb-ws)

## Laravel Backend Requirements

Your Laravel backend needs these API endpoints:

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

### WebSocket
- Reverb configured for presence channels
- Channel: `user.{userId}`
- Event: `SendUpdate`

## Common Issues

### Metro Bundler Issues
```bash
npx expo start -c
```

### Clear Cache
```bash
rm -rf node_modules
npm install
npx expo start -c
```

### Android Build Issues
Make sure you have Android Studio and SDK installed.

## License

Proprietary software for Autovert.

## Support

For issues or questions, contact the development team.
