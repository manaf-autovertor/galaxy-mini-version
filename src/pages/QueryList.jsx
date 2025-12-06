import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useQueryStore } from "../store/queryStore";
import { queryService } from "../services/queryService";
import { authService } from "../services/authService";
import {
  joinPresenceChannel,
  disconnectEcho,
  initializeEcho,
} from "../services/echoService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Search,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

function QueryList() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const queries = useQueryStore((state) => state.queries);
  const counts = useQueryStore((state) => state.counts);
  const setQueries = useQueryStore((state) => state.setQueries);
  const setCounts = useQueryStore((state) => state.setCounts);
  const updateQueryStatus = useQueryStore((state) => state.updateQueryStatus);

  const [mainTab, setMainTab] = useState("raised_to_you");
  const [subTab, setSubTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadQueries();
    loadCounts();

    // Setup real-time listener
    if (user?.id && token) {
      // Initialize Echo if not already initialized
      initializeEcho(token);

      const channel = joinPresenceChannel(user.id, {
        onUpdate: handleRealtimeUpdate,
        here: (users) => console.log("Users here:", users),
        joining: (user) => console.log("User joining:", user),
        leaving: (user) => console.log("User leaving:", user),
        error: (error) => console.error("Presence error:", error),
      });

      return () => {
        channel?.unsubscribe();
      };
    }
  }, [mainTab, subTab, user]);

  const handleRealtimeUpdate = (event) => {
    console.log("Real-time update:", event);

    if (event.type === "QUERY_MESSAGE") {
      // Reload queries and counts
      loadQueries();
      loadCounts();

      // Play notification sound
      const audio = new Audio("/sounds/bell.mp3");
      audio.play().catch((e) => console.warn("Audio play failed:", e));

      toast.success(event.message || "New message received");
    } else if (event.type === "QUERY_MESSAGE_CLOSED") {
      updateQueryStatus(event.query_id, "CLOSED");
      loadCounts();
      toast("Query closed", { icon: "✓" });
    }
  };

  const loadQueries = async () => {
    try {
      setLoading(true);
      const params = {
        main_tab: mainTab,
        sub_tab: subTab,
      };
      const data = await queryService.getQueries(params);
      // API returns paginated response with data.data property
      setQueries(data.data || data.queries || data || []);
    } catch (error) {
      console.error("Failed to load queries:", error);
      toast.error("Failed to load queries");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredQueries = Array.isArray(queries)
    ? queries.filter(
        (query) =>
          query.query_reference
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          query.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          query.query_category
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          query.query_subcategory
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : [];

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "REVERTED":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "CLOSED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-gradient-to-r from-orange-500 to-amber-500 text-white";
      case "REVERTED":
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white";
      case "CLOSED":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg safe-top">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => navigate("/home")}
              className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                Queries
              </h1>
              <p className="text-xs text-gray-600">Manage your queries</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search queries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-md border border-gray-100"
            />
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex px-4 gap-3 pb-3 pt-2">
          <button
            onClick={() => {
              setMainTab("raised_to_you");
              setSubTab("pending");
            }}
            className={`flex-1 py-3 px-4 font-bold rounded-2xl transition-all shadow-lg ${
              mainTab === "raised_to_you"
                ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/50"
                : "bg-white text-gray-600 hover:shadow-xl border border-gray-200"
            }`}
          >
            <span className="flex items-center justify-center gap-2 text-sm">
              Raised to You
              {counts.raised_to_you.pending > 0 && (
                <span className="px-2 py-0.5 text-xs bg-white/20 backdrop-blur-sm text-white rounded-full font-bold">
                  {counts.raised_to_you.pending}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => {
              setMainTab("raised_by_you");
              setSubTab("pending");
            }}
            className={`flex-1 py-3 px-4 font-bold rounded-2xl transition-all shadow-lg ${
              mainTab === "raised_by_you"
                ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/50"
                : "bg-white text-gray-600 hover:shadow-xl border border-gray-200"
            }`}
          >
            <span className="flex items-center justify-center gap-2 text-sm">
              Raised by You
              {counts.raised_by_you.pending > 0 && (
                <span className="px-2 py-0.5 text-xs bg-white/20 backdrop-blur-sm text-white rounded-full font-bold">
                  {counts.raised_by_you.pending}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-white/20 sticky top-[200px] z-10 px-6 py-4 flex gap-2">
        <button
          onClick={() => setSubTab("pending")}
          className={`px-5 py-2.5 font-semibold text-sm rounded-2xl transition-all ${
            subTab === "pending"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
              : "bg-white text-gray-600 hover:shadow-md border border-gray-200"
          }`}
        >
          Pending{" "}
          {counts[mainTab]?.pending > 0 && `(${counts[mainTab].pending})`}
        </button>
        {mainTab !== "all" && (
          <button
            onClick={() => setSubTab("reverted")}
            className={`px-5 py-2.5 font-semibold text-sm rounded-2xl transition-all ${
              subTab === "reverted"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
                : "bg-white text-gray-600 hover:shadow-md border border-gray-200"
            }`}
          >
            Reverted{" "}
            {counts[mainTab]?.reverted > 0 && `(${counts[mainTab].reverted})`}
          </button>
        )}
        <button
          onClick={() => setSubTab("closed")}
          className={`px-5 py-2.5 font-semibold text-sm rounded-2xl transition-all ${
            subTab === "closed"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
              : "bg-white text-gray-600 hover:shadow-md border border-gray-200"
          }`}
        >
          Closed
        </button>
      </div>

      {/* Query List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading queries...</p>
            </div>
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-orange-500" />
              </div>
              <p className="text-gray-900 font-bold text-lg">
                No queries found
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Your queries will appear here"}
              </p>
            </div>
          </div>
        ) : (
          filteredQueries.map((query, index) => (
            <div
              key={query.id}
              onClick={() =>
                navigate(`/chat/${query.parent_query_id || query.id}`)
              }
              className="group bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl active:scale-[0.98] transition-all duration-300 cursor-pointer border border-gray-100 relative overflow-hidden"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: "fadeInUp 0.5s ease-out forwards",
              }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900 text-base">
                      {query.query_reference || `Query #${query.id}`}
                    </span>
                    {query.is_priority && (
                      <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    {query.query_category} • {query.query_subcategory}
                  </p>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md ${getStatusColor(
                    query.status
                  )}`}
                >
                  {getStatusIcon(query.status)}
                  {query.status}
                </div>
              </div>

              <p className="relative text-sm text-gray-700 line-clamp-2 mb-4 leading-relaxed">
                {query.message || "No message"}
              </p>

              <div className="relative flex items-center justify-between text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  App ID: {query.application_id}
                </span>
                <span>
                  {format(new Date(query.created_at), "MMM dd, HH:mm")}
                </span>
              </div>

              {query.unread_count > 0 && (
                <div className="relative mt-3 pt-3 border-t border-gray-100">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    {query.unread_count} new message
                    {query.unread_count > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default QueryList;
