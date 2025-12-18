import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import { useQueryStore } from "../store/queryStore";
import { queryService } from "../services/queryService";
import { format } from "date-fns";
import Toast from "react-native-toast-message";

function ChatWindow({ route }) {
  const { queryId } = route.params;
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messages = useQueryStore((state) => state.messages);
  const setMessages = useQueryStore((state) => state.setMessages);
  const selectedQuery = useQueryStore((state) => state.selectedQuery);
  const setSelectedQuery = useQueryStore((state) => state.setSelectedQuery);

  useEffect(() => {
    loadQueryDetails();
    loadMessages();
  }, [queryId]);

  const loadQueryDetails = async () => {
    try {
      const data = await queryService.getQuery(queryId);
      setSelectedQuery(data);
    } catch (error) {
      console.error("Failed to load query:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await queryService.getMessages(queryId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const messageText = message.trim();
    setMessage("");
    setSending(true);

    try {
      await queryService.sendMessage(queryId, messageText);
      await loadMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to send message",
      });
    } finally {
      setSending(false);
    }
  };

  const handleAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      await queryService.uploadDocument(queryId, file);
      
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "File uploaded successfully",
      });
      
      await loadMessages();
    } catch (error) {
      console.error("Failed to upload file:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to upload file",
      });
    }
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.sender_id === selectedQuery?.user_id;

    return (
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
        ]}
      >
        {!isOwn && (
          <Text style={styles.senderName}>{item.sender_name}</Text>
        )}
        <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
          {item.message}
        </Text>
        <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
          {item.created_at ? format(new Date(item.created_at), "h:mm a") : ""}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        {/* Messages List */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.messagesList}
          inverted
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
            </View>
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachment}>
            <Ionicons name="attach" size={24} color="#6b7280" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim() || sending}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#f97316", "#d97706"]}
              style={styles.sendButton}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  messageBubbleOwn: {
    alignSelf: "flex-end",
    backgroundColor: "#f97316",
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: "#1f2937",
    lineHeight: 20,
  },
  messageTextOwn: {
    color: "#fff",
  },
  messageTime: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  messageTimeOwn: {
    color: "rgba(255,255,255,0.8)",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: "#f3f4f6",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1f2937",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatWindow;
