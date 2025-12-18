import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";

function Profile() {
  const user = useAuthStore((state) => state.user);

  const profileSections = [
    { icon: "person-outline", label: "Name", value: user?.name || "N/A" },
    { icon: "mail-outline", label: "Email", value: user?.email || "N/A" },
    { icon: "briefcase-outline", label: "Role", value: user?.role || "User" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <LinearGradient colors={["#f97316", "#d97706"]} style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          </View>
          <Text style={styles.headerName}>{user?.name || "User"}</Text>
          <Text style={styles.headerEmail}>{user?.email || ""}</Text>
        </LinearGradient>

        {/* Profile Info */}
        <View style={styles.content}>
          {profileSections.map((section, index) => (
            <View key={index} style={styles.infoCard}>
              <Ionicons name={section.icon} size={24} color="#6b7280" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>{section.label}</Text>
                <Text style={styles.infoValue}>{section.value}</Text>
              </View>
            </View>
          ))}

          {/* Settings Options */}
          <TouchableOpacity style={styles.optionCard}>
            <Ionicons name="settings-outline" size={24} color="#6b7280" />
            <Text style={styles.optionText}>Account Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Ionicons name="notifications-outline" size={24} color="#6b7280" />
            <Text style={styles.optionText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Ionicons name="lock-closed-outline" size={24} color="#6b7280" />
            <Text style={styles.optionText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#f97316",
  },
  headerName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  content: {
    padding: 24,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  optionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
});

export default Profile;
