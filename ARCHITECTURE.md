# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Query Mobile App                          │
│                       (React + Vite)                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTPS + WebSocket (WSS)
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                     Laravel Backend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Sanctum   │  │   Reverb    │  │  Database   │            │
│  │    Auth     │  │  WebSocket  │  │   MySQL/    │            │
│  │             │  │   Server    │  │  Postgres   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
React App
├── Pages (Views)
│   ├── Login
│   │   └── Handles authentication
│   ├── QueryList
│   │   ├── Main tabs (Raised to You / Raised by You)
│   │   ├── Sub tabs (Pending / Reverted / Closed)
│   │   └── Query cards
│   └── ChatWindow
│       ├── Message list
│       ├── Input area
│       └── File attachments
│
├── Services (Business Logic)
│   ├── api.js
│   │   └── Axios HTTP client with interceptors
│   ├── authService.js
│   │   └── Login, logout, get user
│   ├── queryService.js
│   │   └── Query CRUD, messages, documents
│   └── echoService.js
│       └── WebSocket connection, presence channels
│
├── Store (State Management)
│   ├── authStore.js
│   │   └── User & token state (persisted)
│   └── queryStore.js
│       └── Queries, messages, counts
│
└── Components (Reusable)
    └── DocumentUploadModal.jsx
        └── File upload with preview
```

---

## Data Flow

### 1. Authentication Flow

```
User Action          React App              Laravel API
    |                    |                       |
    |  Enter Email/Pass  |                       |
    |------------------->|                       |
    |                    |  POST /api/login      |
    |                    |---------------------->|
    |                    |                       |
    |                    |  { token, user }      |
    |                    |<----------------------|
    |                    |                       |
    |                    | Store in localStorage |
    |                    | + Zustand            |
    |                    |                       |
    |                    | Initialize Echo       |
    |                    |                       |
    |  Redirect to /     |                       |
    |<-------------------|                       |
```

---

### 2. Real-time Message Flow

```
User A (Mobile)      React App        Laravel Echo      User B (Web)
     |                   |                 |                 |
     | Type message      |                 |                 |
     |------------------>|                 |                 |
     |                   | POST /messages  |                 |
     |                   |--------------->|                 |
     |                   |                 |                 |
     |                   |                 | SendUpdate      |
     |                   |                 | Event           |
     |                   |                 |---------------->|
     |                   |<----------------|                 |
     |                   | Update UI       |                 |
     |                   | Play sound      |                 |
     |                   | Show toast      |                 |
     |                   |                 |                 |
     | See message       |                 | See message     |
     |<------------------|                 |---------------->|
```

---

### 3. Query List Loading

```
User                React App           API               State
 |                     |                 |                 |
 | Navigate to /       |                 |                 |
 |-------------------->|                 |                 |
 |                     | GET /queries    |                 |
 |                     | ?main=to_you    |                 |
 |                     | &sub=pending    |                 |
 |                     |---------------->|                 |
 |                     |                 | Query DB        |
 |                     |                 | Apply filters   |
 |                     |<----------------|                 |
 |                     |                 |                 |
 |                     | Update store    |                 |
 |                     |---------------------------------->|
 |                     |                 |                 |
 | See query list      |<----------------------------------|
 |<--------------------|                 |                 |
```

---

## State Management Architecture

### Zustand Stores

```javascript
// Auth Store (Persisted in localStorage)
{
  token: "Bearer eyJ0eXAiOiJKV1QiLCJhbGc...",
  user: {
    id: 1,
    name: "John Doe",
    email: "john@example.com"
  }
}

// Query Store (In-memory)
{
  queries: [
    {
      id: 1,
      query_reference: "REF-001",
      status: "PENDING",
      message: "Query message...",
      // ... more fields
    }
  ],
  selectedQuery: { /* current query */ },
  messages: [ /* message array */ ],
  counts: {
    raised_by_you: { pending: 5, reverted: 1, closed: 0 },
    raised_to_you: { pending: 3, reverted: 0, closed: 0 }
  }
}
```

---

## API Endpoints Architecture

```
Laravel Backend API Structure

/api
├── /login                    POST   Login with email/password
├── /logout                   POST   Logout current user
├── /user                     GET    Get authenticated user
│
├── /queries
│   ├── /                     GET    List all queries (with filters)
│   ├── /counts               GET    Get query counts for badges
│   ├── /{id}                 GET    Get single query details
│   ├── /{id}/messages
│   │   ├── /                 GET    Get all messages for query
│   │   └── /                 POST   Send new message
│   ├── /{id}/documents       POST   Upload documents
│   ├── /{id}/close           POST   Close query
│   ├── /{id}/status          PATCH  Update query status
│   └── /{id}/participants    POST   Add participant to query
│
└── /users
    └── /search               GET    Search users by name/email
```

---

## WebSocket Architecture

### Echo Configuration

```javascript
const echo = new Echo({
  broadcaster: 'reverb',
  key: 'app-key',
  wsHost: 'your-host.com',
  wsPort: 443,
  forceTLS: true,
  authEndpoint: '/broadcasting/auth',
  auth: {
    headers: {
      Authorization: 'Bearer token'
    }
  }
});
```

### Channel Structure

```
Laravel Reverb Channels

presence:user.{userId}
├── Events
│   └── SendUpdate
│       ├── type: "QUERY_MESSAGE" | "QUERY_MESSAGE_CLOSED"
│       ├── query_id: 123
│       ├── message: "New message received"
│       ├── user_id: 456
│       └── data: { /* additional data */ }
│
└── Presence
    ├── here(users)      - Initial user list
    ├── joining(user)    - User joins channel
    └── leaving(user)    - User leaves channel
```

---

## File Upload Architecture

```
User                React App           Laravel API         Storage
 |                      |                    |                |
 | Select files         |                    |                |
 |--------------------->|                    |                |
 |                      | Preview files      |                |
 |                      | Show thumbnails    |                |
 |                      |                    |                |
 | Click Upload         |                    |                |
 |--------------------->|                    |                |
 |                      | FormData()         |                |
 |                      | append files       |                |
 |                      |                    |                |
 |                      | POST /documents    |                |
 |                      | multipart/form     |                |
 |                      |------------------->|                |
 |                      |                    | Validate       |
 |                      |                    | Process        |
 |                      |                    | Store files    |
 |                      |                    |--------------->|
 |                      |                    |                |
 |                      |    Success         |                |
 |                      |<-------------------|                |
 |                      |                    |                |
 | Upload complete      |                    |                |
 |<---------------------|                    |                |
```

---

## Security Architecture

### Authentication Layer

```
Every API Request

1. Check localStorage for token
   ├─ Yes: Add to Authorization header
   └─ No: Redirect to /login

2. API Request with Bearer token
   └─> Laravel Sanctum validates token

3. Response
   ├─ 200 OK: Continue
   ├─ 401 Unauthorized: Clear token, redirect to /login
   └─ Other error: Show error message
```

### CORS Configuration

```
Allowed Origins:
├─ http://localhost:3000 (Development)
├─ https://your-domain.com (Production)
└─ https://staging.your-domain.com (Staging)

Allowed Methods:
├─ GET
├─ POST
├─ PUT
├─ PATCH
└─ DELETE

Credentials: Included (for cookies/auth)
```

---

## Performance Architecture

### Optimization Strategies

```
1. Code Splitting
   └─ React.lazy() for route-based splitting

2. Asset Optimization
   ├─ Vite build minification
   ├─ Tree shaking unused code
   └─ Image compression

3. Caching Strategy
   ├─ Static assets: 1 year cache
   ├─ API responses: No cache
   └─ Service Worker: Future PWA support

4. Bundle Analysis
   └─ Separate vendor chunks
      ├─ React/React-DOM
      ├─ Router
      ├─ Echo/Pusher
      └─ Other libraries
```

---

## Deployment Architecture

### Development Environment

```
┌──────────────┐
│ Developer PC │
│              │
│ localhost:   │
│  - :3000     │ React Dev Server (Vite)
│  - :8000     │ Laravel Dev Server
│  - :8080     │ Reverb Dev Server
└──────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────┐
│              CDN / Static Hosting                │
│            (Netlify/Vercel/S3)                   │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │     React App (Static Build)            │    │
│  │     ├─ index.html                       │    │
│  │     ├─ assets/                          │    │
│  │     └─ service-worker.js (future)       │    │
│  └────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────┘
                   │
                   │ HTTPS + WSS
                   │
┌──────────────────┴──────────────────────────────┐
│           Production Laravel Server              │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  Laravel App                             │   │
│  │  ├─ API Routes                           │   │
│  │  ├─ Sanctum Auth                         │   │
│  │  └─ Reverb Server                        │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  Database (MySQL/PostgreSQL)             │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Error Handling Architecture

```
Error Types & Handling

1. Network Errors
   ├─ Axios interceptor catches
   ├─ Show user-friendly message
   └─ Log to console

2. Authentication Errors (401)
   ├─ Clear token
   ├─ Redirect to /login
   └─ Show "Session expired" message

3. Validation Errors (422)
   ├─ Display field-specific errors
   └─ Highlight invalid inputs

4. Server Errors (500)
   ├─ Show generic error message
   ├─ Log to monitoring service
   └─ Provide retry option

5. WebSocket Errors
   ├─ Auto-reconnect (Echo handles)
   ├─ Show connection status
   └─ Buffer messages until reconnect
```

---

## Monitoring Architecture

```
Application Monitoring

┌─────────────────────────────────────────┐
│           React Application              │
│  ┌─────────────────────────────────┐   │
│  │  Error Boundary                  │   │
│  │  └─> Catch React errors          │   │
│  └─────────────────────────────────┘   │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  Axios Interceptors              │   │
│  │  └─> Catch API errors            │   │
│  └─────────────────────────────────┘   │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  Echo Error Handlers             │   │
│  │  └─> Catch WebSocket errors      │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │
               │ Send errors to
               │
┌──────────────┴──────────────────────────┐
│     Error Tracking Service               │
│     (Sentry / LogRocket / etc.)         │
└─────────────────────────────────────────┘
```

---

## Scaling Considerations

### Current Capacity
- **Users:** Supports hundreds of concurrent users
- **Messages:** Real-time with Reverb
- **Files:** Limited by Laravel storage config

### Future Scaling
1. **Horizontal Scaling**
   - Load balancer for Laravel instances
   - Redis for session/cache sharing
   - Separate Reverb server cluster

2. **CDN Integration**
   - Static assets via CDN
   - Reduced origin requests
   - Global distribution

3. **Database Optimization**
   - Read replicas
   - Query optimization
   - Caching layer (Redis)

4. **File Storage**
   - Move to S3/Cloud Storage
   - CDN for file delivery
   - Image optimization service

---

## Technology Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18 | UI components & rendering |
| **Build Tool** | Vite 5 | Fast dev server & optimized builds |
| **Routing** | React Router 6 | Client-side navigation |
| **State Management** | Zustand 4 | Global state (auth, queries) |
| **HTTP Client** | Axios 1.6 | API communication |
| **WebSocket Client** | Laravel Echo 1.16 | Real-time events |
| **Real-time Engine** | Pusher.js 8.4 | WebSocket connection |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **Icons** | Lucide React | Beautiful icon set |
| **Date Handling** | date-fns 3.3 | Date formatting |
| **Notifications** | React Hot Toast | Toast notifications |
| **Backend** | Laravel 11 | API server |
| **Auth** | Laravel Sanctum | Token authentication |
| **Broadcasting** | Laravel Reverb | WebSocket server |
| **Database** | MySQL/PostgreSQL | Data persistence |

---

## File Structure Explanation

```
query-mobile-app/
│
├── 📁 src/
│   ├── 📁 pages/              Frontend screens
│   │   ├── Login.jsx          Authentication page
│   │   ├── QueryList.jsx      Query list with tabs
│   │   └── ChatWindow.jsx     Chat interface
│   │
│   ├── 📁 services/           API & WebSocket logic
│   │   ├── api.js             HTTP client setup
│   │   ├── authService.js     Auth endpoints
│   │   ├── queryService.js    Query endpoints
│   │   └── echoService.js     WebSocket setup
│   │
│   ├── 📁 store/              Global state
│   │   ├── authStore.js       User & token
│   │   └── queryStore.js      Queries & messages
│   │
│   ├── 📁 components/         Reusable components
│   │   └── DocumentUploadModal.jsx
│   │
│   ├── App.jsx                Root component
│   ├── main.jsx               Entry point
│   └── index.css              Global styles
│
├── 📁 public/                 Static assets
│   └── sounds/
│       └── bell.mp3           Notification sound
│
├── 📁 .vscode/                VS Code config
│   ├── settings.json          Editor settings
│   └── extensions.json        Recommended extensions
│
├── 📄 Configuration Files
│   ├── package.json           Dependencies
│   ├── vite.config.js         Build config
│   ├── tailwind.config.js     Styling config
│   ├── postcss.config.js      CSS processing
│   ├── .env                   Environment vars
│   └── .env.example           Env template
│
├── 📄 Setup Scripts
│   ├── setup.ps1              Windows setup
│   └── setup.sh               Linux/Mac setup
│
└── 📚 Documentation
    ├── README.md              Main docs
    ├── QUICKSTART.md          Quick setup
    ├── LARAVEL_SETUP.md       Backend setup
    ├── DEPLOYMENT.md          Deploy guide
    ├── FEATURES.md            Feature list
    ├── ARCHITECTURE.md        This file
    └── PROJECT_SUMMARY.md     Complete overview
```

---

## Development Workflow

```
1. Feature Request
   └─> Create branch

2. Development
   ├─> Write code
   ├─> Test locally
   └─> Check console for errors

3. Testing
   ├─> Test all user flows
   ├─> Test real-time updates
   ├─> Test on mobile device
   └─> Check responsive design

4. Code Review
   └─> Review by team

5. Deployment
   ├─> Build production
   ├─> Run tests
   ├─> Deploy to staging
   ├─> Test staging
   └─> Deploy to production

6. Monitoring
   ├─> Check error logs
   ├─> Monitor performance
   └─> Gather user feedback
```

---

## Best Practices Implemented

✅ **Code Organization**
- Clear separation of concerns
- Modular component structure
- Reusable service layer

✅ **State Management**
- Centralized state with Zustand
- Persistent auth state
- Immutable updates

✅ **Error Handling**
- Try-catch blocks
- User-friendly error messages
- Automatic token refresh

✅ **Performance**
- Code splitting
- Lazy loading
- Optimized re-renders

✅ **Security**
- Token-based auth
- Secure WebSocket (WSS)
- CORS protection

✅ **User Experience**
- Loading states
- Error states
- Empty states
- Smooth animations

✅ **Mobile First**
- Touch-friendly
- Responsive design
- Safe area insets

---

**Last Updated:** December 2024  
**Version:** 1.0.0
