import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

function Layout() {
  const location = useLocation();

  // Don't show bottom nav on login, query list, and chat window pages
  const hideBottomNav =
    location.pathname === "/login" ||
    location.pathname === "/queries" ||
    location.pathname.startsWith("/chat/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Outlet />
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

export default Layout;
