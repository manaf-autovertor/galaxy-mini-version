import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQueryStore } from "../store/queryStore";
import { queryService } from "../services/queryService";
import { format } from "date-fns";

function QueryList() {
  const navigation = useNavigation();
  const queries = useQueryStore((state) => state.queries);
  const setQueries = useQueryStore((state) => state.setQueries);
  const [loading, setLoading] = useState(false);
  const [mainTab, setMainTab] = useState("to_you");
  const [subTab, setSubTab] = useState("pending");

  useEffect(() => {
    loadQueries();
  }, [mainTab, subTab]);

  const loadQueries = async () => {
    setLoading(true);
    try {
      const data = await queryService.getQueries({ main: mainTab, sub: subTab });
      setQueries(data);
    } catch (error) {
      console.error("Failed to load queries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#f59e0b";
      case "reverted":
        return "#ef4444";
      case "closed":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  };

  const renderQueryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.queryCard}
      onPress={() => navigation.navigate("ChatWindow", { queryId: item.id })}
    >
      <View style={styles.queryHeader}>
        <Text style={styles.queryRef}>{item.query_reference || `#${item.id}`}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.queryMessage} numberOfLines={2}>
        {item.message || "No message"}
      </Text>
      <View style={styles.queryFooter}>
        <View style={styles.queryMeta}>
          <Ionicons name="person-outline" size={14} color="#6b7280" />
          <Text style={styles.queryMetaText}>{item.raised_by}</Text>
        </View>
        <Text style={styles.queryTime}>
          {item.created_at
            ? format(new Date(item.created_at), "MMM d, h:mm a")
            : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Tabs */}
      <View style={styles.mainTabs}>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === "to_you" && styles.mainTabActive]}
          onPress={() => setMainTab("to_you")}
        >
          <Text
            style={[
              styles.mainTabText,
              mainTab === "to_you" && styles.mainTabTextActive,
            ]}
          >
            Raised to You
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === "by_you" && styles.mainTabActive]}
          onPress={() => setMainTab("by_you")}
        >
          <Text
            style={[
              styles.mainTabText,
              mainTab === "by_you" && styles.mainTabTextActive,
            ]}
          >
            Raised by You
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTabs}>
        {["pending", "reverted", "closed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.subTab, subTab === tab && styles.subTabActive]}
            onPress={() => setSubTab(tab)}
          >
            <Text
              style={[
                styles.subTabText,
                subTab === tab && styles.subTabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Query List */}
      <FlatList
        data={queries}
        renderItem={renderQueryCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadQueries} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No queries found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  mainTabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  mainTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  mainTabActive: {
    borderBottomColor: "#f97316",
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  mainTabTextActive: {
    color: "#f97316",
  },
  subTabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  subTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  subTabActive: {
    backgroundColor: "#fed7aa",
  },
  subTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  subTabTextActive: {
    color: "#f97316",
  },
  list: {
    padding: 16,
  },
  queryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  queryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  queryRef: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },
  queryMessage: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 12,
    lineHeight: 20,
  },
  queryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  queryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  queryMetaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  queryTime: {
    fontSize: 12,
    color: "#9ca3af",
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
    marginTop: 16,
  },
});

export default QueryList;
