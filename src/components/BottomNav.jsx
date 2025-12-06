import { useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, MessageSquarePlus, User, LayoutGrid } from "lucide-react";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "home", icon: Home, label: "Home", route: "/home" },
    { id: "applications", icon: FileText, label: "Apps", route: "/applications" },
    { id: "queries", icon: MessageSquarePlus, label: "", route: "/queries", isCenter: true },
    { id: "more", icon: LayoutGrid, label: "More", route: "/more" },
    { id: "profile", icon: User, label: "Profile", route: "/profile" },
  ];

  const isActive = (route) => location.pathname === route;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 safe-bottom">
      {/* Glassmorphism Background */}
      <div className="relative">
        {/* Gradient Glow Effect */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none"></div>
        
        {/* Main Nav Bar */}
        <div className="relative mx-4 mb-4 backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl border border-white/20">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              if (item.isCenter) {
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.route)}
                    className="relative -mt-8 group"
                  >
                    {/* Outer Glow Ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
                    
                    {/* Main Button */}
                    <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all group-active:scale-95">
                      <item.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
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
                    active ? "bg-gradient-to-br from-indigo-50 to-purple-50" : "hover:bg-gray-50"
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
                          : "text-gray-500 group-hover:text-gray-700"
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                      style={
                        active
                          ? {
                              filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))",
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
                        : "text-gray-500 group-hover:text-gray-700"
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
