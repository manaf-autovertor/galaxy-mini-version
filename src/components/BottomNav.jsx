import { useNavigate, useLocation } from "react-router-dom";
import { useQueryStore } from "../store/queryStore";
import {
  Home,
  FileText,
  MessageSquarePlus,
  User,
  LayoutGrid,
} from "lucide-react";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const counts = useQueryStore((state) => state.counts);

  const navItems = [
    { id: "home", icon: Home, label: "Home", route: "/home" },
    {
      id: "applications",
      icon: FileText,
      label: "Apps",
      route: "/applications",
    },
    {
      id: "queries",
      icon: MessageSquarePlus,
      label: "",
      route: "/queries",
      isCenter: true,
    },
    { id: "more", icon: LayoutGrid, label: "More", route: "/more" },
    { id: "profile", icon: User, label: "Profile", route: "/profile" },
  ];

  const isActive = (route) => location.pathname === route;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 safe-bottom">
      {/* Glassmorphism Background */}
      <div className="relative">
        {/* Gradient Glow Effect */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-gray-900 dark:via-gray-900/50 dark:to-transparent pointer-events-none transition-colors duration-300"></div>

        {/* Main Nav Bar */}
        <div className="relative mx-4 mb-4 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              if (item.isCenter) {
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.route)}
                    className="relative -mt-8 group"
                  >
                    {/* Main Button */}
                    <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all group-active:scale-95">
                      <item.icon
                        className="w-8 h-8 text-white"
                        strokeWidth={2.5}
                      />
                      {counts.raised_to_you?.pending > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[22px] h-7 px-1.5 bg-red-700 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse border-2 border-white">
                          {counts.raised_to_you.pending}
                        </span>
                      )}
                    </div>

                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-full border-4 border-orange-500/30 group-hover:scale-125 transition-transform duration-300"></div>
                  </button>
                );
              }

              const active = isActive(item.route);

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.route)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all group ${
                    active
                      ? "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div
                    className={`relative transition-all duration-300 ${
                      active ? "scale-110" : "group-hover:scale-105"
                    }`}
                  >
                    <item.icon
                      className={`w-6 h-6 transition-colors ${
                        active
                          ? "text-transparent bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                      style={
                        active
                          ? {
                              filter:
                                "drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))",
                            }
                          : {}
                      }
                    />
                    {active && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold transition-all ${
                      active
                        ? "text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BottomNav;
