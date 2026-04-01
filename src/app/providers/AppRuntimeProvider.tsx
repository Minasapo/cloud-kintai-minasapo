import type { ReactNode } from "react";
import { useContext } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import { useDuplicateAttendanceWarning } from "@/hooks/useDuplicateAttendanceWarning";
import { useNetworkStatusNotification } from "@/hooks/useNetworkStatusNotification";
import { useWorkflowCommentNotification } from "@/hooks/useWorkflowCommentNotification";
import { useWorkflowNotification } from "@/hooks/useWorkflowNotification";

function AppRuntimeEffects() {
  const { authStatus } = useContext(AuthContext);
  const { derived } = useContext(AppConfigContext);

  useDuplicateAttendanceWarning();
  useNetworkStatusNotification();

  const workflowNotificationsEnabled =
    authStatus === "authenticated" && Boolean(derived?.workflowNotificationEnabled);

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
