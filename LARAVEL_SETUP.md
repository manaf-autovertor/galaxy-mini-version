# Laravel Backend Setup for Query Mobile App

This guide explains what you need to add to your Laravel backend to support the mobile React app.

## 1. API Routes

Add these routes to `routes/api.php`:

```php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\QueryController;
use App\Http\Controllers\Api\UserController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Queries
    Route::get('/queries', [QueryController::class, 'index']);
    Route::get('/queries/counts', [QueryController::class, 'counts']);
    Route::get('/queries/{query}', [QueryController::class, 'show']);
    Route::get('/queries/{query}/messages', [QueryController::class, 'messages']);
    Route::post('/queries/{query}/messages', [QueryController::class, 'sendMessage']);
    Route::post('/queries/{query}/documents', [QueryController::class, 'uploadDocument']);
    Route::post('/queries/{query}/close', [QueryController::class, 'close']);
    Route::patch('/queries/{query}/status', [QueryController::class, 'updateStatus']);
    Route::post('/queries/{query}/participants', [QueryController::class, 'addParticipant']);
    
    // Users
    Route::get('/users/search', [UserController::class, 'search']);
});
```

## 2. Auth Controller

Create `app/Http/Controllers/Api/AuthController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
```

## 3. Query Controller

Create `app/Http/Controllers/Api/QueryController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ApplicationQuery;
use App\Models\QueryMessage;
use App\Models\QueryParticipant;
use App\Events\SendUpdate;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class QueryController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $mainTab = $request->get('main_tab', 'raised_to_you');
        $subTab = $request->get('sub_tab', 'pending');

        $query = ApplicationQuery::query()
            ->where('query_type', '!=', 'PARENT')
            ->with(['parent', 'participants', 'raisedBy']);

        // Main tab filter
        if ($mainTab === 'raised_by_you') {
            $query->where('raised_by_user_id', $userId);
        } elseif ($mainTab === 'raised_to_you') {
            $query->whereHas('participants', function ($q) use ($userId) {
                $q->where('user_id', $userId)->where('role', 'to');
            });
        }

        // Sub tab filter
        if ($subTab === 'pending') {
            $query->where('status', 'PENDING')
                ->where(function ($q) {
                    $q->whereNull('parent_query_id')
                        ->orWhereHas('parent', function ($pq) {
                            $pq->where('status', 'PENDING');
                        });
                });
        } elseif ($subTab === 'reverted') {
            $query->where('status', 'REVERTED');
        } elseif ($subTab === 'closed') {
            $query->where('status', 'CLOSED')
                ->orWhereHas('parent', function ($pq) {
                    $pq->where('status', 'CLOSED');
                });
        }

        $queries = $query->latest()->paginate(20);

        return response()->json($queries);
    }

    public function counts(Request $request)
    {
        $userId = Auth::id();
        
        $counts = [
            'raised_by_you' => [
                'pending' => ApplicationQuery::where('raised_by_user_id', $userId)
                    ->where('status', 'PENDING')
                    ->count(),
                'reverted' => ApplicationQuery::where('raised_by_user_id', $userId)
                    ->where('status', 'REVERTED')
                    ->count(),
                'closed' => 0,
            ],
            'raised_to_you' => [
                'pending' => ApplicationQuery::whereHas('participants', function ($q) use ($userId) {
                        $q->where('user_id', $userId)->where('role', 'to');
                    })
                    ->where('status', 'PENDING')
                    ->count(),
                'reverted' => ApplicationQuery::whereHas('participants', function ($q) use ($userId) {
                        $q->where('user_id', $userId)->where('role', 'to');
                    })
                    ->where('status', 'REVERTED')
                    ->count(),
                'closed' => 0,
            ],
        ];

        return response()->json($counts);
    }

    public function show(ApplicationQuery $query)
    {
        $query->load(['participants.user', 'raisedBy', 'closedBy', 'parent']);
        return response()->json($query);
    }

    public function messages(ApplicationQuery $query)
    {
        $messages = QueryMessage::where('application_query_id', $query->id)
            ->with('user')
            ->orderBy('created_at')
            ->get();

        return response()->json($messages);
    }

    public function sendMessage(Request $request, ApplicationQuery $query)
    {
        $request->validate([
            'body' => 'required|string',
        ]);

        $message = QueryMessage::create([
            'application_query_id' => $query->id,
            'user_id' => Auth::id(),
            'body' => $request->body,
        ]);

        $message->load('user');

        // Update last_messaged_by
        $query->update([
            'last_messaged_by' => Auth::id(),
        ]);

        // Broadcast to all participants
        $participants = $query->participants()->pluck('user_id')->unique();
        foreach ($participants as $participantId) {
            if ($participantId != Auth::id()) {
                broadcast(new SendUpdate([
                    'type' => 'QUERY_MESSAGE',
                    'query_id' => $query->id,
                    'message' => 'New message in query ' . $query->query_reference,
                    'user_id' => $participantId,
                    'data' => $message,
                ]));
            }
        }

        return response()->json($message);
    }

    public function close(Request $request, ApplicationQuery $query)
    {
        $query->update([
            'status' => 'CLOSED',
            'closed_at' => now(),
            'closed_by_user_id' => Auth::id(),
        ]);

        // Broadcast to all participants
        $participants = $query->participants()->pluck('user_id')->unique();
        foreach ($participants as $participantId) {
            broadcast(new SendUpdate([
                'type' => 'QUERY_MESSAGE_CLOSED',
                'query_id' => $query->id,
                'message' => 'Query closed',
                'user_id' => $participantId,
            ]));
        }

        return response()->json($query);
    }

    public function updateStatus(Request $request, ApplicationQuery $query)
    {
        $request->validate([
            'status' => 'required|in:PENDING,REVERTED,CLOSED',
        ]);

        $query->update(['status' => $request->status]);

        return response()->json($query);
    }

    public function addParticipant(Request $request, ApplicationQuery $query)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:to,cc',
        ]);

        $participant = QueryParticipant::firstOrCreate([
            'application_query_id' => $query->id,
            'user_id' => $request->user_id,
            'role' => $request->role,
        ]);

        return response()->json($participant);
    }

    public function uploadDocument(Request $request, ApplicationQuery $query)
    {
        $request->validate([
            'attachments' => 'required|array',
            'attachments.*' => 'file|max:10240', // 10MB max
        ]);

        // Handle file uploads (implement based on your existing document upload logic)
        // This is a placeholder - adjust according to your Document model

        return response()->json(['message' => 'Documents uploaded successfully']);
    }
}
```

## 4. User Controller

Create `app/Http/Controllers/Api/UserController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q');

        if (!$query) {
            return response()->json([]);
        }

        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json($users);
    }
}
```

## 5. CORS Configuration

Update `config/cors.php`:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'], // Add your React app URL
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## 6. Sanctum Configuration

Ensure `config/sanctum.php` includes:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    Sanctum::currentApplicationUrlWithPort()
))),
```

## 7. Broadcasting Configuration

Ensure your `config/broadcasting.php` has Reverb configured:

```php
'reverb' => [
    'driver' => 'reverb',
    'key' => env('REVERB_APP_KEY'),
    'secret' => env('REVERB_APP_SECRET'),
    'app_id' => env('REVERB_APP_ID'),
    'options' => [
        'host' => env('REVERB_HOST'),
        'port' => env('REVERB_PORT', 443),
        'scheme' => env('REVERB_SCHEME', 'https'),
    ],
],
```

## 8. Broadcasting Auth

Ensure `routes/channels.php` has:

```php
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
```

## 9. Test the Setup

1. Start Laravel: `php artisan serve`
2. Start Reverb: `php artisan reverb:start`
3. Start React app: `npm run dev`
4. Login and test real-time messaging

## 10. Production Considerations

- Set proper CORS origins
- Use HTTPS for all connections
- Configure proper Reverb host/port
- Set up proper authentication token expiration
- Add rate limiting to API routes
- Implement proper file upload validation and storage

## Troubleshooting

### 401 Unauthorized
- Check Sanctum configuration
- Verify token is being sent in Authorization header
- Check CORS settings

### WebSocket Not Connecting
- Verify Reverb is running
- Check Reverb configuration matches React app .env
- Ensure broadcasting auth route is accessible

### Messages Not Broadcasting
- Check SendUpdate event is implementing ShouldBroadcast
- Verify channel authorization in routes/channels.php
- Check Laravel logs for broadcasting errors
