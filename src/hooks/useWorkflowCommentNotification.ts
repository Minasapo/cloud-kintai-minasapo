import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { useCallback, useContext, useEffect, useRef } from "react";

import { AuthContext } from "@/context/AuthContext";
import { subscribeWorkflowCommentNotifications } from "@/features/workflow/notification/model/workflowNotificationEventService";
import { createLogger } from "@/shared/lib/logger";

import { useLocalNotification } from "./useLocalNotification";

const logger = createLogger("useWorkflowCommentNotification");

export const useWorkflowCommentNotification = () => {
  const { authStatus, cognitoUser } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs } = useStaffs({ isAuthenticated });
  const { notify, canNotify } = useLocalNotification();
  const notifiedEventIdsRef = useRef<Set<string>>(new Set());

  const currentStaffId = (() => {
    if (!isAuthenticated || !cognitoUser?.id) return null;
    return (
      staffs.find((staff) => staff.cognitoUserId === cognitoUser.id)?.id ?? null
    );
  })();

  const handleNotification = useCallback(
    (eventId: string, title: string, body: string) => {
      if (!canNotify) return;
      if (notifiedEventIdsRef.current.has(eventId)) return;

      notifiedEventIdsRef.current.add(eventId);
      void notify(title, {
        body,
        tag: `workflow-comment-event-${eventId}`,
        mode: "auto-close",
        priority: "high",
      });
    },
    [canNotify, notify],
  );

  useEffect(() => {
    if (!currentStaffId) {
      return;
    }

    logger.info("Starting global workflow comment notification subscription", {
      recipientStaffId: currentStaffId,
    });

    const unsubscribe = subscribeWorkflowCommentNotifications({
      recipientStaffId: currentStaffId,
      onReceived: (event) => {
        handleNotification(event.id, event.title, event.body);
      },
      onError: (error) => {
        logger.error("Global workflow comment notification error:", error);
      },
    });

    return () => {
      logger.info(
        "Stopping global workflow comment notification subscription",
        {
          recipientStaffId: currentStaffId,
        },
      );
      unsubscribe();
    };
  }, [currentStaffId, handleNotification]);

  return {
    isSubscribed: Boolean(currentStaffId),
  };
};
