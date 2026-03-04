import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { updateWorkflowNotificationEvent } from "@shared/api/graphql/documents/mutations";
import { workflowNotificationEventsByRecipient } from "@shared/api/graphql/documents/queries";
import {
  onCreateWorkflowNotificationEvent,
  onUpdateWorkflowNotificationEvent,
} from "@shared/api/graphql/documents/subscriptions";
import {
  ModelSortDirection,
  OnCreateWorkflowNotificationEventSubscription,
  OnUpdateWorkflowNotificationEventSubscription,
  UpdateWorkflowNotificationEventMutation,
  WorkflowNotificationEventsByRecipientQuery,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AuthContext } from "@/context/AuthContext";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("useWorkflowNotificationInbox");
const NOTIFICATION_PAGE_SIZE = 10;

type WorkflowNotificationEvent = NonNullable<
  NonNullable<
    WorkflowNotificationEventsByRecipientQuery["workflowNotificationEventsByRecipient"]
  >["items"][number]
>;

const sortByEventAtDesc = (
  left: WorkflowNotificationEvent,
  right: WorkflowNotificationEvent,
) => new Date(right.eventAt).getTime() - new Date(left.eventAt).getTime();

export const useWorkflowNotificationInbox = () => {
  const { authStatus, cognitoUser } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs } = useStaffs({ isAuthenticated });

  const [notifications, setNotifications] = useState<
    WorkflowNotificationEvent[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);

  const currentStaffId = useMemo(() => {
    if (!isAuthenticated || !cognitoUser?.id) return null;
    return (
      staffs.find((staff) => staff.cognitoUserId === cognitoUser.id)?.id ?? null
    );
  }, [cognitoUser?.id, isAuthenticated, staffs]);

  const fetchUnreadCount = useCallback(async (recipientStaffId: string) => {
    let total = 0;
    let cursor: string | null = null;

    do {
      const response = (await graphqlClient.graphql({
        query: workflowNotificationEventsByRecipient,
        variables: {
          recipientStaffId,
          sortDirection: ModelSortDirection.DESC,
          limit: 100,
          nextToken: cursor,
          filter: {
            isRead: { eq: false },
          },
        },
        authMode: "userPool",
      })) as GraphQLResult<WorkflowNotificationEventsByRecipientQuery>;

      if (response.errors?.length) {
        throw new Error(response.errors[0].message);
      }

      const connection = response.data?.workflowNotificationEventsByRecipient;
      const countInPage =
        connection?.items.filter((item): item is WorkflowNotificationEvent =>
          Boolean(item),
        ).length ?? 0;
      total += countInPage;
      cursor = connection?.nextToken ?? null;
    } while (cursor);

    setUnreadCount(total);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!currentStaffId) {
      setNotifications([]);
      setUnreadCount(0);
      setNextToken(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = (await graphqlClient.graphql({
        query: workflowNotificationEventsByRecipient,
        variables: {
          recipientStaffId: currentStaffId,
          sortDirection: ModelSortDirection.DESC,
          limit: NOTIFICATION_PAGE_SIZE,
        },
        authMode: "userPool",
      })) as GraphQLResult<WorkflowNotificationEventsByRecipientQuery>;

      if (response.errors?.length) {
        throw new Error(response.errors[0].message);
      }

      const items =
        response.data?.workflowNotificationEventsByRecipient?.items
          .filter((item): item is WorkflowNotificationEvent => Boolean(item))
          .toSorted(sortByEventAtDesc) ?? [];

      setNotifications(items);
      setNextToken(
        response.data?.workflowNotificationEventsByRecipient?.nextToken ?? null,
      );
      await fetchUnreadCount(currentStaffId);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : String(fetchError);
      setError(message);
      logger.error("Failed to fetch workflow notifications:", message);
    } finally {
      setLoading(false);
    }
  }, [currentStaffId, fetchUnreadCount]);

  const loadMoreNotifications = useCallback(async () => {
    if (!currentStaffId || !nextToken || loadingMore) {
      return;
    }

    setLoadingMore(true);
    setError(null);
    try {
      const response = (await graphqlClient.graphql({
        query: workflowNotificationEventsByRecipient,
        variables: {
          recipientStaffId: currentStaffId,
          sortDirection: ModelSortDirection.DESC,
          limit: NOTIFICATION_PAGE_SIZE,
          nextToken,
        },
        authMode: "userPool",
      })) as GraphQLResult<WorkflowNotificationEventsByRecipientQuery>;

      if (response.errors?.length) {
        throw new Error(response.errors[0].message);
      }

      const items =
        response.data?.workflowNotificationEventsByRecipient?.items
          .filter((item): item is WorkflowNotificationEvent => Boolean(item))
          .toSorted(sortByEventAtDesc) ?? [];

      setNotifications((previous) => {
        const previousIds = new Set(previous.map((item) => item.id));
        const merged = [...previous];
        items.forEach((item) => {
          if (!previousIds.has(item.id)) {
            merged.push(item);
          }
        });
        return merged.toSorted(sortByEventAtDesc);
      });
      setNextToken(
        response.data?.workflowNotificationEventsByRecipient?.nextToken ?? null,
      );
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : String(fetchError);
      setError(message);
      logger.error("Failed to load more workflow notifications:", message);
    } finally {
      setLoadingMore(false);
    }
  }, [currentStaffId, loadingMore, nextToken]);

  const applyIncomingEvent = useCallback(
    (incoming: WorkflowNotificationEvent) => {
      setNotifications((previous) => {
        const index = previous.findIndex((item) => item.id === incoming.id);
        const previousEvent = index >= 0 ? previous[index] : null;

        if (!previousEvent && !incoming.isRead) {
          setUnreadCount((prev) => prev + 1);
        }

        if (previousEvent && previousEvent.isRead && !incoming.isRead) {
          setUnreadCount((prev) => prev + 1);
        }

        if (previousEvent && !previousEvent.isRead && incoming.isRead) {
          setUnreadCount((prev) => Math.max(prev - 1, 0));
        }

        if (index >= 0) {
          const next = [...previous];
          next[index] = incoming;
          return next.toSorted(sortByEventAtDesc);
        }
        return [incoming, ...previous].toSorted(sortByEventAtDesc);
      });
    },
    [],
  );

  const markAsRead = useCallback(async (id: string) => {
    const readAt = new Date().toISOString();
    const response = (await graphqlClient.graphql({
      query: updateWorkflowNotificationEvent,
      variables: {
        input: {
          id,
          isRead: true,
          readAt,
        },
      },
      authMode: "userPool",
    })) as GraphQLResult<UpdateWorkflowNotificationEventMutation>;

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    let decremented = false;
    setNotifications((previous) =>
      previous.map((notification) => {
        if (notification.id !== id) {
          return notification;
        }

        if (!notification.isRead) {
          decremented = true;
        }

        return { ...notification, isRead: true, readAt };
      }),
    );

    if (decremented) {
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter((item) => !item.isRead)
      .map((item) => item.id);
    await Promise.all(unreadIds.map((id) => markAsRead(id)));
    setUnreadCount(0);
  }, [markAsRead, notifications]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!currentStaffId) {
      return;
    }

    const filter = {
      recipientStaffId: { eq: currentStaffId },
    };

    const createSubscription = graphqlClient
      .graphql({
        query: onCreateWorkflowNotificationEvent,
        variables: { filter },
        authMode: "userPool",
      })
      .subscribe({
        next: ({ data }) => {
          const event = (
            data as OnCreateWorkflowNotificationEventSubscription | undefined
          )?.onCreateWorkflowNotificationEvent;
          if (!event) return;
          applyIncomingEvent(event as WorkflowNotificationEvent);
        },
        error: (subscriptionError) => {
          logger.error(
            "Create workflow notification subscription error:",
            subscriptionError,
          );
        },
      });

    const updateSubscription = graphqlClient
      .graphql({
        query: onUpdateWorkflowNotificationEvent,
        variables: { filter },
        authMode: "userPool",
      })
      .subscribe({
        next: ({ data }) => {
          const event = (
            data as OnUpdateWorkflowNotificationEventSubscription | undefined
          )?.onUpdateWorkflowNotificationEvent;
          if (!event) return;
          applyIncomingEvent(event as WorkflowNotificationEvent);
        },
        error: (subscriptionError) => {
          logger.error(
            "Update workflow notification subscription error:",
            subscriptionError,
          );
        },
      });

    return () => {
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
    };
  }, [applyIncomingEvent, currentStaffId]);

  return {
    currentStaffId,
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore: nextToken !== null,
    error,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
  };
};
