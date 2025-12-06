import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useQueryStore } from "../store/queryStore";
import { queryService } from "../services/queryService";
import { joinPresenceChannel } from "../services/echoService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Download,
  CheckCircle2,
  Clock,
  User,
  Users,
  MoreVertical,
  XCircle,
  Loader2,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

function ChatWindow() {
  const { queryId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const selectedQuery = useQueryStore((state) => state.selectedQuery);
  const messages = useQueryStore((state) => state.messages);
  const setSelectedQuery = useQueryStore((state) => state.setSelectedQuery);
  const setMessages = useQueryStore((state) => state.setMessages);
  const addMessage = useQueryStore((state) => state.addMessage);
  const updateQueryStatus = useQueryStore((state) => state.updateQueryStatus);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadQueryDetails();
    loadMessages();

    // Setup real-time listener
    if (user?.id) {
      const channel = joinPresenceChannel(user.id, {
        onUpdate: handleRealtimeUpdate,
      });

      return () => {
        channel?.unsubscribe();
      };
    }
  }, [queryId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRealtimeUpdate = (event) => {
    console.log("Chat real-time update:", event);

    if (event.type === "QUERY_MESSAGE" && event.query_id == queryId) {
      // Add new message to list
      if (event.message) {
        addMessage(event.message);
      } else {
        loadMessages(); // Fallback
      }

      // Play notification sound
      const audio = new Audio("/sounds/bell.mp3");
      audio.play().catch((e) => console.warn("Audio play failed:", e));
    } else if (
      event.type === "QUERY_MESSAGE_CLOSED" &&
      event.query_id == queryId
    ) {
      updateQueryStatus(queryId, "CLOSED");
      setSelectedQuery({ ...selectedQuery, status: "CLOSED" });
      toast("Query closed", { icon: "✓" });
    }
  };

  const loadQueryDetails = async () => {
    try {
      setLoading(true);
      const data = await queryService.getQuery(queryId);
      setSelectedQuery(data);
    } catch (error) {
      console.error("Failed to load query:", error);
      toast.error("Failed to load query details");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await queryService.getMessages(queryId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageBody.trim() && attachments.length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    setSending(true);

    try {
      const formData = new FormData();
      formData.append("body", messageBody);

      if (attachments.length > 0) {
        attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
      }

      await queryService.sendMessage(queryId, formData);

      setMessageBody("");
      setAttachments([]);

      // Reload messages
      await loadMessages();

      toast.success("Message sent");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleCloseQuery = async () => {
    if (!window.confirm("Are you sure you want to close this query?")) {
      return;
    }

    try {
      await queryService.closeQuery(queryId, { status: "CLOSED" });
      updateQueryStatus(queryId, "CLOSED");
      setSelectedQuery({ ...selectedQuery, status: "CLOSED" });
      toast.success("Query closed successfully");
      setShowActions(false);
    } catch (error) {
      console.error("Failed to close query:", error);
      toast.error("Failed to close query");
    }
  };

  const formatMessageDate = (date) => {
    const messageDate = new Date(date);

    if (isToday(messageDate)) {
      return format(messageDate, "HH:mm");
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, "HH:mm")}`;
    } else {
      return format(messageDate, "MMM dd, HH:mm");
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

  const canInteract = selectedQuery?.status !== "CLOSED";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-800 shadow-lg safe-top transition-colors duration-300">
        <div className="px-6 py-5">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/queries")}
              className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h2 className="font-bold text-xl bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                {selectedQuery?.query_reference || `Query #${queryId}`}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                {selectedQuery?.query_category} •{" "}
                {selectedQuery?.query_subcategory}
              </p>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 border border-gray-200 dark:border-gray-700"
            >
              <Users className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 border border-gray-200 dark:border-gray-700"
            >
              <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-1.5 rounded-2xl text-xs font-bold shadow-md ${getStatusColor(
                selectedQuery?.status
              )}`}
            >
              {selectedQuery?.status}
            </span>
            {selectedQuery?.is_priority && (
              <span className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl text-xs font-bold shadow-md animate-pulse">
                Priority
              </span>
            )}
          </div>
        </div>

        {/* Details Dropdown */}
        {showDetails && (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-sm space-y-3 shadow-inner">
            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-2xl shadow-sm">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Application ID:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {selectedQuery?.application_id}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-2xl shadow-sm">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Type:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {selectedQuery?.query_type}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-2xl shadow-sm">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Subcategory:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {selectedQuery?.query_subcategory}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-2xl shadow-sm">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Created:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {format(
                  new Date(selectedQuery?.created_at),
                  "MMM dd, yyyy HH:mm"
                )}
              </span>
            </div>
          </div>
        )}

        {/* Actions Dropdown */}
        {showActions && (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700 shadow-inner">
            {canInteract && (
              <button
                onClick={handleCloseQuery}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl transition-all text-sm font-bold shadow-lg hover:shadow-xl active:scale-95"
              >
                <XCircle className="w-5 h-5" />
                Close Query
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar pb-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-indigo-600" />
              </div>
              <p className="text-gray-900 dark:text-white font-bold text-lg">No messages yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Start the conversation
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.user_id === user?.id;
            const showDateDivider =
              index === 0 ||
              format(new Date(messages[index - 1].created_at), "yyyy-MM-dd") !==
                format(new Date(message.created_at), "yyyy-MM-dd");

            return (
              <div key={message.id}>
                {showDateDivider && (
                  <div className="flex items-center justify-center my-6">
                    <span className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                      {format(new Date(message.created_at), "MMMM dd, yyyy")}
                    </span>
                  </div>
                )}

                <div
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  } animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] ${
                      isOwnMessage ? "items-end" : "items-start"
                    } flex flex-col`}
                  >
                    {!isOwnMessage && (
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                          <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">
                          {message.user?.name}
                        </span>
                      </div>
                    )}

                    <div
                      className={`rounded-3xl px-5 py-3.5 shadow-lg ${
                        isOwnMessage
                          ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-br-lg"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-lg border border-gray-100 dark:border-gray-600"
                      }`}
                    >
                      <div
                        className="text-sm break-words leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: message.safe_body_html || message.body,
                        }}
                      />

                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                            {message.attachments.map((attachment, i) => (
                              <a
                                key={i}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs hover:underline"
                              >
                                <Paperclip className="w-3 h-3" />
                                {attachment.name}
                              </a>
                            ))}
                          </div>
                        )}
                    </div>

                    <span
                      className={`text-xs mt-1 px-1 ${
                        isOwnMessage ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {formatMessageDate(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {canInteract ? (
        <div className="flex-shrink-0 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 px-6 py-4 shadow-lg safe-bottom transition-colors duration-300">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl text-sm shadow-md border border-indigo-100 dark:border-gray-600"
                >
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium max-w-[150px] truncate">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-2xl transition-all flex-shrink-0 shadow-lg hover:shadow-xl active:scale-95 h-[52px] w-[52px]"
            >
              <Paperclip className="w-5 h-5 text-white" />
            </button>

            <input
              ref={fileInputRef}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex-1 relative">
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-800 rounded-3xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                style={{ minHeight: "52px", maxHeight: "120px" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={
                sending || (!messageBody.trim() && attachments.length === 0)
              }
              className="p-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl active:scale-95 h-[52px] w-[52px]"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 backdrop-blur-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-t border-red-200 dark:border-red-800 px-6 py-5 text-center shadow-lg safe-bottom">
          <div className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-red-200 dark:border-red-800">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-gray-700 dark:text-gray-300 text-sm font-bold">
              This query is closed. You cannot send new messages.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
