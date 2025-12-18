import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { useQueryStore } from "../store/queryStore";
import { authService } from "../services/authService";
import { queryService } from "../services/queryService";
import { disconnectEcho } from "../services/echoService";

function Home() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const counts = useQueryStore((state) => state.counts);
  const setCounts = useQueryStore((state) => state.setCounts);
  const [activeNotifications] = useState(3);

  useEffect(() => {
    loadCounts();
  }, []);

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
    }
  };

  const menuItems = [
    {
      id: "applications",
      title: "Applications",
      description: "View & manage applications",
      icon: "document-text",
      colors: ["#3b82f6", "#06b6d4"],
      route: "Applications",
    },
    {
      id: "queries",
      title: "Queries",
      description: "Handle customer queries",
      icon: "chatbubbles",
      colors: ["#f97316", "#d97706"],
      route: "Queries",
      count: counts.raised_to_you?.pending || 0,
    },
    {
      id: "deviations",
      title: "Deviations",
      description: "Review deviations",
      icon: "git-branch",
      colors: ["#a855f7", "#ec4899"],
      route: "Deviations",
    },
    {
      id: "requests",
      title: "Requests",
      description: "Pending requests",
      icon: "checkmark-done",
      colors: ["#22c55e", "#10b981"],
      route: "Requests",
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Performance insights",
      icon: "trending-up",
      colors: ["#6366f1", "#3b82f6"],
      route: "Analytics",
    },
    {
      id: "team",
      title: "Team",
      description: "Manage your team",
      icon: "people",
      colors: ["#f43f5e", "#ef4444"],
      route: "Team",
    },
  ];

  const quickStats = [
    { label: "Today's Tasks", value: "0", icon: "target", color: "#3b82f6" },
    {
      label: "Completion Rate",
      value: "3%",
      icon: "bar-chart",
      color: "#22c55e",
    },
    { label: "Active Cases", value: "0", icon: "flash", color: "#f97316" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoSection}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.welcomeText}>
                Welcome, {user?.name?.split(" ")[0]}
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Notifications")}
                style={styles.notificationButton}
              >
                <LinearGradient
                  colors={["#6366f1", "#a855f7"]}
                  style={styles.gradientButton}
                >
                  <Ionicons name="notifications" size={20} color="#fff" />
                  {activeNotifications > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {activeNotifications}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
                <View style={styles.iconButton}>
                  <Ionicons name="settings" size={20} color="#374151" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <LinearGradient
                  colors={["#ef4444", "#f43f5e"]}
                  style={styles.gradientButton}
                >
                  <Ionicons name="log-out" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Assistant Banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate("AI Assistant")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#8b5cf6", "#a855f7", "#d946ef"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiBanner}
          >
            <View style={styles.aiBannerContent}>
              <View>
                <View style={styles.aiBannerTitle}>
                  <Ionicons name="sparkles" size={24} color="#fbbf24" />
                  <Text style={styles.aiBannerTitleText}>AI Assistant</Text>
                </View>
                <Text style={styles.aiBannerSubtitle}>
                  Need help? Ask me anything!
                </Text>
              </View>
              <View style={styles.aiBannerButton}>
                <Text style={styles.aiBannerButtonText}>Chat</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
              style={styles.menuCard}
            >
              <LinearGradient colors={item.colors} style={styles.menuIcon}>
                <Ionicons name={item.icon} size={32} color="#fff" />
                {item.count > 0 && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.count}</Text>
                  </View>
                )}
              </LinearGradient>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {[
            { action: "Query resolved", time: "2 mins ago", color: "#22c55e" },
            {
              action: "New application",
              time: "15 mins ago",
              color: "#3b82f6",
            },
            {
              action: "Deviation approved",
              time: "1 hour ago",
              color: "#a855f7",
            },
          ].map((activity, index) => (
            <View key={index} style={styles.activityCard}>
              <View
                style={[
                  styles.activityDot,
                  { backgroundColor: activity.color },
                ]}
              />
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 28,
    height: 28,
  },
  welcomeText: {
    fontSize: 12,
    color: "#6b7280",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  gradientButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationButton: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },
  aiBanner: {
    margin: 24,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiBannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiBannerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aiBannerTitleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  aiBannerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  aiBannerButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  aiBannerButtonText: {
    color: "#8b5cf6",
    fontWeight: "600",
    fontSize: 14,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 16,
  },
  menuCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  menuIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  menuBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 14,
    minWidth: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  menuBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  activitySection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  activityTime: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
});

export default Home;
