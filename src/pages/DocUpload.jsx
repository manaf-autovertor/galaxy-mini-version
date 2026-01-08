import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  User,
  Phone,
  Mail,
  Building2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  Calendar,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

function DocUpload() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    perPage: 15,
    lastPage: 1,
    currentPage: 1,
  });

  useEffect(() => {
    loadApplications(currentPage);
  }, [currentPage]);

  const loadApplications = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/api/mobile/applications", {
        params: {
          page: page,
          per_page: 15,
        },
      });

      if (response.data.success) {
        setApplications(response.data.data.data);
        setPagination({
          total: response.data.data.total,
          perPage: response.data.data.per_page,
          lastPage: response.data.data.last_page,
          currentPage: response.data.data.current_page,
        });
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadgeColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const statusLower = String(status).toLowerCase();
    if (statusLower.includes("approved") || statusLower.includes("disburs"))
      return "bg-green-100 text-green-700";
    if (statusLower.includes("pending") || statusLower.includes("progress"))
      return "bg-yellow-100 text-yellow-700";
    if (statusLower.includes("rejected") || statusLower.includes("cancel"))
      return "bg-red-100 text-red-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg safe-top">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                DOC Upload
              </h1>
              <p className="text-xs text-gray-600">
                {pagination.total} Applications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FileText className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Applications Found
            </h2>
            <p className="text-gray-600">
              There are no applications available at the moment.
            </p>
          </div>
        ) : (
          <>
            {/* Applications List */}
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="bg-white rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-md">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {application.customer?.profile_first_name}{" "}
                          {application.customer?.profile_last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          App ID: #{application.id}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/doc-upload/${application.id}`)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl text-sm font-semibold hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>

                  {/* Status Badge */}
                  {(application.app_current_status_final ||
                    application.app_status) && (
                    <div className="mb-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(
                          application.app_current_status_final ||
                            application.app_status
                        )}`}
                      >
                        {application.app_current_status_final ||
                          application.app_status}
                      </span>
                    </div>
                  )}

                  {/* Customer Details */}
                  <div className="space-y-2 mb-4">
                    {application.customer?.profile_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {application.customer.profile_phone}
                        </span>
                      </div>
                    )}
                    {application.customer?.profile_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {application.customer.profile_email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product & Dealer Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {application.product && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-semibold text-gray-600">
                            Product
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {application.product.product_short_name ||
                            application.product.product_name}
                        </p>
                      </div>
                    )}
                    {application.dealer && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-semibold text-gray-600">
                            Dealer
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {application.dealer.dealer_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {application.dealer.dealer_code}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Lead Info */}
                  {application.lead && (
                    <div className="bg-gray-50 rounded-2xl p-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {application.lead.lead_sourcing_type && (
                          <div>
                            <span className="text-gray-500">Source Type:</span>
                            <p className="font-semibold text-gray-900">
                              {application.lead.lead_sourcing_type}
                            </p>
                          </div>
                        )}
                        {application.lead.lead_sourcing_channel && (
                          <div>
                            <span className="text-gray-500">Channel:</span>
                            <p className="font-semibold text-gray-900">
                              {application.lead.lead_sourcing_channel}
                            </p>
                          </div>
                        )}
                        {application.lead.fos_name && (
                          <div>
                            <span className="text-gray-500">FOS:</span>
                            <p className="font-semibold text-gray-900">
                              {application.lead.fos_name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created: {formatDate(application.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.lastPage > 1 && (
              <div className="mt-6 flex items-center justify-between bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition-all ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg active:scale-95"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Page {currentPage} of {pagination.lastPage}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.lastPage}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition-all ${
                    currentPage === pagination.lastPage
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg active:scale-95"
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DocUpload;
