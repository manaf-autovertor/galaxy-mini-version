import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useQueryStore } from "../store/queryStore";
import { authService } from "../services/authService";
import { queryService } from "../services/queryService";
import { disconnectEcho } from "../services/echoService";
import {
  FileText,
  MessageSquareText,
  GitBranch,
  FileCheck,
  TrendingUp,
  Users,
  Bell,
  Settings,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  LogOut,
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const counts = useQueryStore((state) => state.counts);
  const setCounts = useQueryStore((state) => state.setCounts);
  const [activeNotifications] = useState(3);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const data = await queryService.getQueryCounts();
      setCounts(data);
    } catch (error) {
      console.error("Failed to load counts:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      disconnectEcho();
      logout();
      navigate("/login");
    }
  };

  const menuItems = [
    {
      id: "applications",
      title: "Applications",
      description: "View & manage applications",
      icon: FileText,
      gradient: "from-blue-500 to-cyan-500",
      route: "/applications",
      count: null,
    },
    {
      id: "queries",
      title: "Queries",
      description: "Handle customer queries",
      icon: MessageSquareText,
      gradient: "from-orange-500 to-amber-500",
      route: "/queries",
      count: counts.raised_to_you?.pending || 0,
    },
    {
      id: "deviations",
      title: "Deviations",
      description: "Review deviations",
      icon: GitBranch,
      gradient: "from-purple-500 to-pink-500",
      route: "/deviations",
      count: null,
    },
    {
      id: "requests",
      title: "Requests",
      description: "Pending requests",
      icon: FileCheck,
      gradient: "from-green-500 to-emerald-500",
      route: "/requests",
      count: null,
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Performance insights",
      icon: TrendingUp,
      gradient: "from-indigo-500 to-blue-500",
      route: "/analytics",
      count: null,
    },
    {
      id: "team",
      title: "Team",
      description: "Manage your team",
      icon: Users,
      gradient: "from-rose-500 to-red-500",
      route: "/team",
      count: null,
    },
  ];

  const quickStats = [
    {
      label: "Today's Tasks",
      value: "0",
      icon: Target,
      color: "text-blue-500",
    },
    {
      label: "Completion Rate",
      value: "3%",
      icon: BarChart3,
      color: "text-green-500",
    },
    { label: "Active Cases", value: "0", icon: Zap, color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300 pt-2">
      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-800 shadow-lg transition-colors duration-300">
        <div className="px-6 py-6 safe-top">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo_light.png"
                alt="Galaxy Logo"
                className="h-7 w-auto dark:hidden"
              />
              <img
                src="/logo_dark.png"
                alt="Galaxy Logo"
                className="h-7 w-auto hidden dark:block"
              />
              <div>
                {/* <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Galaxy
                </h1> */}
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Welcome, {user?.name?.split(" ")[0]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/notifications")}
                className="relative p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <Bell className="w-5 h-5 text-white" />
                {activeNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {activeNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 border border-gray-100 dark:border-gray-700"
              >
                <Settings className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </button>
              <button
                onClick={handleLogout}
                className="p-3 bg-gradient-to-br from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 pb-32">
        {/* AI Assistant Banner */}
        <div className="mb-6 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-yellow-300" />
                <h3 className="text-white font-bold text-lg">AI Assistant</h3>
              </div>
              <p className="text-white/90 text-sm">
                Need help? Ask me anything!
              </p>
            </div>
            <button
              onClick={() => navigate("/ai-assistant")}
              className="px-6 py-3 bg-white text-purple-600 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all active:scale-95"
            >
              Chat
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => navigate(item.route)}
              className="group relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer border border-gray-100 dark:border-gray-700 overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
            >
              {/* Gradient Background Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>

              {/* Icon Container */}
              <div
                className={`relative w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110 duration-300`}
              >
                <item.icon className="w-8 h-8 text-white" />
                {item.count && (
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {item.count}
                  </span>
                )}
              </div>

              {/* Text Content */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </p>

              {/* Hover Arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              {
                action: "Query resolved",
                time: "2 mins ago",
                color: "bg-green-500",
              },
              {
                action: "New application",
                time: "15 mins ago",
                color: "bg-blue-500",
              },
              {
                action: "Deviation approved",
                time: "1 hour ago",
                color: "bg-purple-500",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-lg transition-all"
              >
                <div
                  className={`w-2 h-2 ${activity.color} rounded-full animate-pulse`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
