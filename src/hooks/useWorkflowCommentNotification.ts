import {
  StaffRole,
  useStaffs,
} from "@entities/staff/model/useStaffs/useStaffs";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";

import { AuthContext } from "@/context/AuthContext";
import { subscribeWorkflowCommentNotifications } from "@/features/workflow/notification/model/workflowNotificationEventService";
import { createLogger } from "@/shared/lib/logger";

import { useLocalNotification } from "./useLocalNotification";

const logger = createLogger("useWorkflowCommentNotification");

export const useWorkflowCommentNotification = () => {
  const { authStatus, cognitoUser, isCognitoUserRole } =
    useContext(AuthContext);
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

  const isAdminWatcher = useMemo(
    () =>
      isCognitoUserRole(StaffRole.ADMIN) ||
      isCognitoUserRole(StaffRole.STAFF_ADMIN) ||
      isCognitoUserRole(StaffRole.OWNER),
    [isCognitoUserRole],
  );

  const recipientIds = useMemo(() => {
    const selfIds = [currentStaffId, cognitoUser?.id].filter(
      (id): id is string => Boolean(id),
    );

    if (!isAdminWatcher) {
      return selfIds.filter((id, index, list) => list.indexOf(id) === index);
    }

    const adminIds = staffs
      .filter(
        (staff) =>
          staff.role === StaffRole.ADMIN ||
          staff.role === StaffRole.STAFF_ADMIN ||
          staff.role === StaffRole.OWNER,
      )
      .flatMap((staff) => [staff.id, staff.cognitoUserId ?? null])
      .filter((id): id is string => Boolean(id));

    return [...selfIds, ...adminIds].filter(
      (id, index, list) => list.indexOf(id) === index,
    );
  }, [cognitoUser?.id, currentStaffId, isAdminWatcher, staffs]);

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
    if (recipientIds.length === 0) {
      return;
    }

    logger.info("Starting global workflow comment notification subscription", {
      recipientStaffIds: recipientIds,
    });

    const unsubscribes = recipientIds.map((recipientStaffId) =>
      subscribeWorkflowCommentNotifications({
        recipientStaffId,
        onReceived: (event) => {
          handleNotification(event.id, event.title, event.body);
        },
        onError: (error) => {
          logger.error("Global workflow comment notification error:", {
            recipientStaffId,
            error,
          });
        },
      }),
    );

    return () => {
      logger.info(
        "Stopping global workflow comment notification subscription",
        {
          recipientStaffIds: recipientIds,
        },
      );
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [handleNotification, recipientIds]);

  return {
    isSubscribed: recipientIds.length > 0,
  };
};
