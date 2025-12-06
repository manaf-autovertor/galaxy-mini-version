import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Bot, User, Loader2, ChevronDown, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [loadingModels, setLoadingModels] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchAvailableModels();
  }, []);

  const fetchAvailableModels = async () => {
    setLoadingModels(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();
      const models = data.models
        .filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
        .map((model) => ({
          name: model.name.replace("models/", ""),
          displayName: model.displayName || model.name.replace("models/", ""),
          description: model.description || "",
        }));

      setAvailableModels(models);
      if (models.length > 0) {
        setSelectedModel(models[0].name);
      }
      toast.success(`Loaded ${models.length} models`);
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("Failed to load models. Using default.");
      // Fallback models
      const fallbackModels = [
        { name: "gemini-1.5-flash-latest", displayName: "Gemini 1.5 Flash", description: "Fast responses" },
        { name: "gemini-1.5-pro-latest", displayName: "Gemini 1.5 Pro", description: "Advanced reasoning" },
        { name: "gemini-pro", displayName: "Gemini Pro", description: "General purpose" },
      ];
      setAvailableModels(fallbackModels);
      setSelectedModel(fallbackModels[0].name);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: userMessage }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const aiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to get AI response. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg safe-top">
        <div className="px-6 py-5">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
                <p className="text-xs text-gray-600">Powered by Gemini AI</p>
              </div>
            </div>
            <button
              onClick={fetchAvailableModels}
              disabled={loadingModels}
              className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-white ${loadingModels ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              disabled={loadingModels || availableModels.length === 0}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-200 hover:border-violet-300 transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-gray-700">
                  {loadingModels
                    ? "Loading models..."
                    : availableModels.find((m) => m.name === selectedModel)?.displayName || "Select Model"}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showModelDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-64 overflow-y-auto z-30">
                {availableModels.map((model) => (
                  <button
                    key={model.name}
                    onClick={() => {
                      setSelectedModel(model.name);
                      setShowModelDropdown(false);
                      toast.success(`Switched to ${model.displayName}`);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-violet-50 transition-all border-b border-gray-100 last:border-b-0 ${
                      selectedModel === model.name ? "bg-violet-100" : ""
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">{model.displayName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{model.name}</div>
                    {model.description && (
                      <div className="text-xs text-gray-400 mt-1">{model.description}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            } animate-fade-in`}
          >
            <div
              className={`max-w-[85%] ${
                message.role === "user" ? "items-end" : "items-start"
              } flex flex-col`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-md">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700 font-bold">
                    AI Assistant
                  </span>
                </div>
              )}

              <div
                className={`rounded-3xl px-5 py-3.5 shadow-lg ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white rounded-br-lg"
                    : "bg-white text-gray-900 rounded-bl-lg border border-gray-100"
                }`}
              >
                <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[85%] flex flex-col">
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-md">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs text-gray-700 font-bold">
                  AI Assistant
                </span>
              </div>
              <div className="bg-white rounded-3xl rounded-bl-lg px-5 py-3.5 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="backdrop-blur-xl bg-white/90 border-t border-gray-200 px-6 py-4 pb-28 shadow-lg">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              rows={1}
              className="w-full px-5 py-3.5 bg-white rounded-3xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-gray-900 shadow-md border border-gray-200"
              style={{ minHeight: "52px", maxHeight: "120px" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3.5 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
