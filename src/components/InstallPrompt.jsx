import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import {
  setupInstallPrompt,
  showInstallPrompt,
  isPWAInstalled,
} from "../utils/pwaUtils";

function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isPWAInstalled());

    if (!isPWAInstalled()) {
      setupInstallPrompt((canInstall) => {
        setShowPrompt(canInstall);
      });
    }
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();
    if (accepted) {
      setShowPrompt(false);
      setIsInstalled(true);
    }
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-5 shadow-2xl">
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-all"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Download className="w-6 h-6 text-violet-600" />
          </div>

          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">Install App</h3>
            <p className="text-white/90 text-sm mb-4">
              Install this app on your device for a better experience
            </p>

            <button
              onClick={handleInstall}
              className="w-full py-3 bg-white text-violet-600 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Install Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
