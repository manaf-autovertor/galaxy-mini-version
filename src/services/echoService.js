import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Constants from "expo-constants";

let echoInstance = null;

export const initializeEcho = (token) => {
  // Always disconnect existing instance to ensure fresh connection
  if (echoInstance) {
    console.log("Disconnecting existing Echo instance...");
    echoInstance.disconnect();
    echoInstance = null;
  }

  const extra = Constants.expoConfig?.extra || {};

  const config = {
    broadcaster: "reverb",
    key: extra.reverbAppKey,
    wsHost: extra.reverbHost,
    wsPath: extra.reverbPath || "/reverb-ws",
    wssPath: extra.reverbPath || "/reverb-ws",
    wsPort: extra.reverbPort,
    wssPort: extra.reverbPort,
    forceTLS: (extra.reverbScheme || "https") === "https",
    enabledTransports: ["ws", "wss"],
    disableStats: true,
    authorizer: (channel, options) => {
      return {
        authorize: (socketId, callback) => {
          console.log(
            "Authorizing channel:",
            channel.name,
            "Socket ID:",
            socketId
          );
          console.log("Token:", token);

          fetch(
            `${extra.apiBaseUrl}/mobile/broadcasting/auth`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channel.name,
              }),
              credentials: "include",
            }
          )
            .then((response) => {
              console.log("Auth response status:", response.status);
              if (!response.ok) {
                return response.text().then((text) => {
                  console.error("Auth failed response:", text);
                  throw new Error(`Auth failed: ${response.status}`);
                });
              }
              return response.json();
            })
            .then((data) => {
              console.log("Auth response data:", data);
              callback(null, data);
            })
            .catch((error) => {
              console.error("Auth error:", error);
              callback(error, null);
            });
        },
      };
    },
  };

  echoInstance = new Echo(config);

  console.log("Echo initialized:", echoInstance);
  console.log(
    "Auth endpoint:",
    `${extra.apiBaseUrl}/mobile/broadcasting/auth`
  );

  return echoInstance;
};

export const getEcho = () => {
  if (!echoInstance) {
    throw new Error("Echo is not initialized. Call initializeEcho first.");
  }
  return echoInstance;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};

export const joinPresenceChannel = (userId, callbacks = {}, token = null) => {
  // Initialize Echo if not already initialized and token is provided
  if (!echoInstance && token) {
    console.log("Echo not initialized, initializing now...");
    initializeEcho(token);
  }

  const echo = getEcho();
  const channelName = `user.${userId}`;

  console.log(`Attempting to join private channel: ${channelName}`);
  const channel = echo.join(channelName);

  // Log subscription attempt
  channel.subscription.bind("pusher:subscription_succeeded", (data) => {
    console.log(
      "✅ Private channel subscription succeeded:",
      channelName,
      data
    );
    if (callbacks.here) {
      callbacks.here([]);
    }
  });

  channel.subscription.bind("pusher:subscription_error", (error) => {
    console.error("❌ Private channel subscription error:", channelName, error);
    if (callbacks.error) {
      callbacks.error(error);
    }
  });

  // Listen for SendUpdate event
  channel.listen("SendUpdate", (event) => {
    console.log("Received SendUpdate:", event);
    if (callbacks.onUpdate) {
      callbacks.onUpdate(event);
    }
  });

  console.log("Channel subscription object:", channel.subscription);

  return channel;
};
