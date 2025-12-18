import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";

// Import screens
import Login from "../pages/Login";
import Home from "../pages/Home";
import QueryList from "../pages/QueryList";
import ChatWindow from "../pages/ChatWindow";
import Profile from "../pages/Profile";
import AIAssistant from "../pages/AIAssistant";
import PlaceholderPage from "../pages/PlaceholderPage";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "AI Assistant") {
            iconName = focused ? "sparkles" : "sparkles-outline";
          } else if (route.name === "Queries") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "More") {
            iconName = focused ? "menu" : "menu-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#f97316",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="AI Assistant" component={AIAssistant} />
      <Tab.Screen name="Queries" component={QueryList} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen 
        name="More" 
        component={PlaceholderPage}
        initialParams={{ title: "More", description: "Explore additional features and options." }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const token = useAuthStore((state) => state.token);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        // Auth Stack
        <Stack.Screen name="Login" component={Login} />
      ) : (
        // App Stack
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen 
            name="ChatWindow" 
            component={ChatWindow}
            options={{ headerShown: true, title: "Query Chat" }}
          />
          <Stack.Screen 
            name="Applications" 
            component={PlaceholderPage}
            initialParams={{ title: "Applications", description: "View and manage all your applications in one place." }}
            options={{ headerShown: true }}
          />
          <Stack.Screen 
            name="Deviations" 
            component={PlaceholderPage}
            initialParams={{ title: "Deviations", description: "Review and approve deviation requests." }}
            options={{ headerShown: true }}
          />
          <Stack.Screen 
            name="Requests" 
            component={PlaceholderPage}
            initialParams={{ title: "Requests", description: "Handle pending requests and approvals." }}
            options={{ headerShown: true }}
          />
          <Stack.Screen 
            name="Analytics" 
            component={PlaceholderPage}
            initialParams={{ title: "Analytics", description: "View detailed performance insights and reports." }}
            options={{ headerShown: true }}
          />
          <Stack.Screen 
            name="Team" 
            component={PlaceholderPage}
            initialParams={{ title: "Team", description: "Manage your team members and assignments." }}
            options={{ headerShown: true }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={PlaceholderPage}
            initialParams={{ title: "Notifications", description: "View all your notifications and alerts." }}
            options={{ headerShown: true }}
          />
          <Stack.Screen 
            name="Settings" 
            component={PlaceholderPage}
            initialParams={{ title: "Settings", description: "Customize your app preferences." }}
            options={{ headerShown: true }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
