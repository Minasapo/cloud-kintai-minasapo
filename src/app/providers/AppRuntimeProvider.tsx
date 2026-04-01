import type { ReactNode } from "react";
import { useContext, useEffect } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import { useDuplicateAttendanceWarning } from "@/hooks/useDuplicateAttendanceWarning";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import { useNetworkStatusNotification } from "@/hooks/useNetworkStatusNotification";
import { useWorkflowCommentNotification } from "@/hooks/useWorkflowCommentNotification";
import { useWorkflowNotification } from "@/hooks/useWorkflowNotification";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("AppRuntimeProvider");

function AppRuntimeEffects() {
  const { authStatus } = useContext(AuthContext);
  const { derived } = useContext(AppConfigContext);
  const { requestPermission, permission, isSupported } = useLocalNotification();

  useDuplicateAttendanceWarning();
  useNetworkStatusNotification();

  useEffect(() => {
    if (
      authStatus === "authenticated" &&
      isSupported &&
      permission === "default"
    ) {
      requestPermission().catch((error) => {
        logger.warn("Failed to request notification permission:", error);
      });
    }
  }, [authStatus, isSupported, permission, requestPermission]);

  const workflowNotificationsEnabled =
    authStatus === "authenticated" &&
    isSupported &&
    permission === "granted" &&
    Boolean(derived?.workflowNotificationEnabled);

  useWorkflowNotification(workflowNotificationsEnabled);
  useWorkflowCommentNotification(workflowNotificationsEnabled);

  return null;
}

type AppRuntimeProviderProps = {
  children: ReactNode;
};

export function AppRuntimeProvider({ children }: AppRuntimeProviderProps) {
  return (
    <>
      <AppRuntimeEffects />
      {children}
    </>
  );
}
