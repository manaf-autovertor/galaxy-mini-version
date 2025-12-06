import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

let echoInstance = null;

export const initializeEcho = (token) => {
  if (echoInstance) {
    return echoInstance;
  }

  const config = {
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${import.meta.env.VITE_API_BASE_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  };

  echoInstance = new Echo(config);

  console.log("Echo initialized:", echoInstance);

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

export const joinPresenceChannel = (userId, callbacks = {}) => {
  const echo = getEcho();
  const channel = echo.join(`user.${userId}`);

  if (callbacks.here) {
    channel.here(callbacks.here);
  }

  if (callbacks.joining) {
    channel.joining(callbacks.joining);
  }

  if (callbacks.leaving) {
    channel.leaving(callbacks.leaving);
  }

  if (callbacks.error) {
    channel.error(callbacks.error);
  }

  // Listen for SendUpdate event
  channel.listen("SendUpdate", (event) => {
    console.log("Received SendUpdate:", event);
    if (callbacks.onUpdate) {
      callbacks.onUpdate(event);
    }
  });

  return channel;
};
