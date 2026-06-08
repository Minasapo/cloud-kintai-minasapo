import { createLogger } from "@shared/lib/logger";
import { useEffect } from "react";

import { HEARTBEAT_INTERVAL } from "../utils/presenceUtils";

const logger = createLogger("ShiftPresenceHeartbeat");

export const usePresenceHeartbeat = ({
  storageKey,
  storageKeyPrefix,
  loadPresenceFromStorage,
  updateActiveUsers,
  updateActivity,
}: {
  storageKey: string;
  storageKeyPrefix: string;
  loadPresenceFromStorage: () => void;
  updateActiveUsers: () => void;
  updateActivity: () => void;
}) => {
  useEffect(() => {
    const initialSyncTimeout = window.setTimeout(() => {
      updateActiveUsers();
    }, 0);

    const heartbeatIntervalId = window.setInterval(() => {
      updateActiveUsers();
    }, HEARTBEAT_INTERVAL);

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || !event.key.startsWith(storageKeyPrefix)) {
        return;
      }
      loadPresenceFromStorage();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateActivity();
        loadPresenceFromStorage();
      }
    };

    const removeOwnPresence = () => {
      try {
        window.localStorage.removeItem(storageKey);
      } catch (error) {
        logger.error("Failed to remove presence from storage:", error);
      }
    };

    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", removeOwnPresence);

    return () => {
      window.clearTimeout(initialSyncTimeout);
      window.clearInterval(heartbeatIntervalId);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", removeOwnPresence);
      removeOwnPresence();
    };
  }, [
    loadPresenceFromStorage,
    storageKey,
    storageKeyPrefix,
    updateActiveUsers,
    updateActivity,
  ]);
};