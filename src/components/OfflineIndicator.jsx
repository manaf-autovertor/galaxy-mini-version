import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { isOnline, onNetworkStatusChange } from "../utils/pwaUtils";

function OfflineIndicator() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const cleanup = onNetworkStatusChange((status) => {
      setOnline(status);
    });

    return cleanup;
  }, []);

  if (online) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">You are offline</span>
      </div>
    </div>
  );
}

export default OfflineIndicator;
