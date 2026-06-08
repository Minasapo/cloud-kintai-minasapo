import { useEffect, useRef } from "react";

import { CollaborativeUser } from "../types/collaborative.types";
import { EditingCellsMap } from "../types/presence.types";
import { EDIT_TIMEOUT, HEARTBEAT_INTERVAL, INACTIVE_THRESHOLD } from "../utils/presenceUtils";

export const usePresencePeriodicEffects = ({
  updateActiveUsers,
  lastActivityRef,
  setActiveUsers,
  setEditingCellsState,
}: {
  updateActiveUsers: () => void;
  lastActivityRef: React.MutableRefObject<number>;
  setActiveUsers: React.Dispatch<React.SetStateAction<CollaborativeUser[]>>;
  setEditingCellsState: React.Dispatch<React.SetStateAction<EditingCellsMap>>;
}) => {
  const heartbeatIntervalRef = useRef<number | undefined>(undefined);
  const editTimeoutCheckIntervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    lastActivityRef.current = Date.now();
    heartbeatIntervalRef.current = window.setInterval(() => {
      updateActiveUsers();
    }, HEARTBEAT_INTERVAL);

    return () => {
      if (heartbeatIntervalRef.current) {
        window.clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [lastActivityRef, updateActiveUsers]);

  useEffect(() => {
    const checkInactiveUsers = window.setInterval(() => {
      const now = Date.now();
      setActiveUsers((prev) =>
        prev.filter((user) => now - user.lastActivity < INACTIVE_THRESHOLD),
      );
    }, 10000);

    return () => window.clearInterval(checkInactiveUsers);
  }, [setActiveUsers]);

  useEffect(() => {
    editTimeoutCheckIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      setEditingCellsState((prev) => {
        const next = new Map(prev);
        let hasChanges = false;
        next.forEach((editor, cellKey) => {
          if (now - editor.startTime > EDIT_TIMEOUT) {
            next.delete(cellKey);
            hasChanges = true;
          }
        });
        return hasChanges ? next : prev;
      });
    }, 30000);

    return () => {
      if (editTimeoutCheckIntervalRef.current) {
        window.clearInterval(editTimeoutCheckIntervalRef.current);
      }
    };
  }, [setEditingCellsState]);
};