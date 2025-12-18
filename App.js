import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { useAuthStore } from "./src/store/authStore";
import {
  initializeEcho,
  joinPresenceChannel,
} from "./src/services/echoService";
import { Audio } from "expo-av";
import AppNavigator from "./src/navigation/AppNavigator";
import OfflineIndicator from "./src/components/OfflineIndicator";

// Import NativeWind styles
import "./global.css";

function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Initialize Echo and connect to presence channel if user is already logged in
    if (token && user?.id) {
      console.log("User already logged in, connecting to presence channel...");
      console.log("Token:", token);
      console.log("User ID:", user.id);

      try {
        // Initialize Echo (will return existing instance if already initialized)
        const echo = initializeEcho(token);
        console.log("Echo instance:", echo);

        // Join private channel for global notifications
        console.log(`Joining private channel for user: ${user.id}`);
        const channel = joinPresenceChannel(user.id, {
          onUpdate: async (event) => {
            console.log("Global notification received:", event);

            // Show toast notification based on event type
            if (event.type === "QUERY_MESSAGE") {
              Toast.show({
                type: "info",
                text1: "New Message",
                text2: event.message || "New message received",
                visibilityTime: 4000,
              });
            } else if (event.type === "QUERY_MESSAGE_CLOSED") {
              Toast.show({
                type: "success",
                text1: "Query Closed",
                visibilityTime: 3000,
              });
            } else if (event.message) {
              Toast.show({
                type: "info",
                text1: "Notification",
                text2: event.message,
                visibilityTime: 4000,
              });
            }

            // Play notification sound
            try {
              const { sound } = await Audio.Sound.createAsync(
                require("./assets/sounds/bell.mp3")
              );
              await sound.playAsync();
              // Unload sound after playing
              sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                  sound.unloadAsync();
                }
              });
            } catch (error) {
              console.warn("Audio play failed:", error);
            }
          },
          here: () => {
            console.log("✅ Successfully joined private channel!");
          },
          error: (error) => {
            console.error("❌ Private channel error:", error);
          },
        });

        console.log("Channel object:", channel);

        // Cleanup on unmount or when user/token changes
        return () => {
          console.log("Cleaning up presence channel...");
          channel?.unsubscribe();
        };
      } catch (error) {
        console.error("❌ Failed to initialize Echo or join channel:", error);
      }
    }
  }, [token, user]);

  return (
    <>
      <StatusBar style="auto" />
      <OfflineIndicator />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast />
    </>
  );
}

export default App;
