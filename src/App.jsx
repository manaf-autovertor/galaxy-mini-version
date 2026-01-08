import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import {
  initializeEcho,
  joinPresenceChannel,
  getEcho,
} from "./services/echoService";
import Layout from "./components/Layout";
import InstallPrompt from "./components/InstallPrompt";
import OfflineIndicator from "./components/OfflineIndicator";
import Login from "./pages/Login";
import Home from "./pages/Home";
import QueryList from "./pages/QueryList";
import ChatWindow from "./pages/ChatWindow";
import PlaceholderPage from "./pages/PlaceholderPage";
import Profile from "./pages/Profile";
import AIAssistant from "./pages/AIAssistant";
import DocUpload from "./pages/DocUpload";
import DocumentUploadDetail from "./pages/DocumentUploadDetail";

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Initialize Echo and connect to presence channel if user is already logged in
    if (token && user?.id) {
      console.log("User already logged in, connecting to presence channel...");
      console.log("Token:", token);
      console.log("User ID:", user.id);

      try {
        // Initialize Echo (will return existing instance if already initialized)
        const echo = initializeEcho(token);
        console.log("Echo instance:", echo);

        // Join private channel for global notifications
        console.log(`Joining private channel for user: ${user.id}`);
        const channel = joinPresenceChannel(user.id, {
          onUpdate: (event) => {
            console.log("Global notification received:", event);

            // Show toast notification based on event type
            if (event.type === "QUERY_MESSAGE") {
              toast(event.message || "New message received", {
                icon: "🔔",
                duration: 4000,
              });
            } else if (event.type === "QUERY_MESSAGE_CLOSED") {
              toast("Query closed", {
                icon: "✓",
                duration: 3000,
              });
            } else if (event.message) {
              toast(event.message, {
                icon: "🔔",
                duration: 4000,
              });
            }

            // Play notification sound
            const audio = new Audio("/sounds/bell.mp3");
            audio.play().catch((e) => console.warn("Audio play failed:", e));
          },
          here: () => {
            console.log("✅ Successfully joined private channel!");
          },
          error: (error) => {
            console.error("❌ Private channel error:", error);
          },
        });

        console.log("Channel object:", channel);

        // Cleanup on unmount or when user/token changes
        return () => {
          console.log("Cleaning up presence channel...");
          channel?.unsubscribe();
        };
      } catch (error) {
        console.error("❌ Failed to initialize Echo or join channel:", error);
      }
    }
  }, [token, user]);

  return (
    <>
      <OfflineIndicator />
      <InstallPrompt />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Routes without bottom navigation */}
          <Route
            path="/doc-upload"
            element={
              <ProtectedRoute>
                <DocUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doc-upload/:applicationId"
            element={
              <ProtectedRoute>
                <DocumentUploadDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doc-upload/:applicationId/:queryId"
            element={
              <ProtectedRoute>
                <DocumentUploadDetail />
              </ProtectedRoute>
            }
          />

          {/* Routes with Layout (includes bottom navigation) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/queries" element={<QueryList />} />
            <Route path="/chat/:queryId" element={<ChatWindow />} />
            <Route
              path="/applications"
              element={
                <PlaceholderPage
                  title="Applications"
                  description="View and manage all your applications in one place."
                />
              }
            />
            <Route
              path="/deviations"
              element={
                <PlaceholderPage
                  title="Deviations"
                  description="Review and approve deviation requests."
                />
              }
            />
            <Route
              path="/requests"
              element={
                <PlaceholderPage
                  title="Requests"
                  description="Handle pending requests and approvals."
                />
              }
            />
            <Route
              path="/analytics"
              element={
                <PlaceholderPage
                  title="Analytics"
                  description="View detailed performance insights and reports."
                />
              }
            />
            <Route
              path="/team"
              element={
                <PlaceholderPage
                  title="Team"
                  description="Manage your team members and assignments."
                />
              }
            />
            <Route
              path="/notifications"
              element={
                <PlaceholderPage
                  title="Notifications"
                  description="View all your notifications and alerts."
                />
              }
            />
            <Route
              path="/settings"
              element={
                <PlaceholderPage
                  title="Settings"
                  description="Customize your app preferences."
                />
              }
            />
            <Route
              path="/more"
              element={
                <PlaceholderPage
                  title="More"
                  description="Explore additional features and options."
                />
              }
            />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1f4037",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "600",
            borderRadius: "12px",
            padding: "12px 20px",
          },
        }}
      />
    </>
  );
}

export default App;
