import { useNavigate } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

function PlaceholderPage({ title, description }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg safe-top">
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-32">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Construction className="w-12 h-12 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-600 max-w-sm mx-auto">
            {description || `The ${title} feature is currently under development.`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;
