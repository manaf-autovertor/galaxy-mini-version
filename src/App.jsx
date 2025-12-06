import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import QueryList from './pages/QueryList';
import ChatWindow from './pages/ChatWindow';
import PlaceholderPage from './pages/PlaceholderPage';

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/queries" element={<QueryList />} />
            <Route path="/chat/:queryId" element={<ChatWindow />} />
            <Route
              path="/applications"
              element={<PlaceholderPage title="Applications" description="View and manage all your applications in one place." />}
            />
            <Route
              path="/deviations"
              element={<PlaceholderPage title="Deviations" description="Review and approve deviation requests." />}
            />
            <Route
              path="/requests"
              element={<PlaceholderPage title="Requests" description="Handle pending requests and approvals." />}
            />
            <Route
              path="/analytics"
              element={<PlaceholderPage title="Analytics" description="View detailed performance insights and reports." />}
            />
            <Route
              path="/team"
              element={<PlaceholderPage title="Team" description="Manage your team members and assignments." />}
            />
            <Route
              path="/notifications"
              element={<PlaceholderPage title="Notifications" description="View all your notifications and alerts." />}
            />
            <Route
              path="/settings"
              element={<PlaceholderPage title="Settings" description="Customize your app preferences." />}
            />
            <Route
              path="/more"
              element={<PlaceholderPage title="More" description="Explore additional features and options." />}
            />
            <Route
              path="/profile"
              element={<PlaceholderPage title="Profile" description="View and edit your profile information." />}
            />
          </Route>
        </Routes>
      </Router>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f4037',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '12px 20px',
          },
        }}
      />
    </>
  );
}

export default App;
