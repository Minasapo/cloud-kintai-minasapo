import { AuthContext } from "@app/providers/auth/AuthContext";
import {
  StaffRole,
  useStaffs,
} from "@entities/staff/model/useStaffs/useStaffs";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import {
  buildVersionOrUpdatedAtCondition,
  getNextVersion,
} from "@shared/api/graphql/concurrency";
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
import { createLogger } from "@shared/lib/logger";
import { GraphQLResult } from "aws-amplify/api";
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAdminGroupLocalReadState } from "./useAdminGroupLocalReadState";

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

type NotificationStateDeps = {
  setNotifications: Dispatch<SetStateAction<WorkflowNotificationEvent[]>>;
  setUnreadCount: Dispatch<SetStateAction<number>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setNextTokensByRecipient: Dispatch<SetStateAction<Record<string, string | null>>>;
  getLocallyReadAdminIds: () => Set<string>;
};

async function executeFetchNotificationPage(recipientStaffId: string, options?: { nextToken?: string | null }) {
  const response = (await graphqlClient.graphql({
    query: workflowNotificationEventsByRecipient,
    variables: { recipientStaffId, sortDirection: ModelSortDirection.DESC, limit: NOTIFICATION_PAGE_SIZE, nextToken: options?.nextToken ?? null },
    authMode: "userPool",
  })) as GraphQLResult<WorkflowNotificationEventsByRecipientQuery>;
  if (response.errors?.length) throw new Error(response.errors[0].message);
  return response.data?.workflowNotificationEventsByRecipient;
}

function toUniqueSortedItems(items: WorkflowNotificationEvent[]) {
  const dedupedMap = new Map<string, WorkflowNotificationEvent>();
  items.forEach((item) => { dedupedMap.set(item.id, item); });
  return [...dedupedMap.values()].toSorted(sortByEventAtDesc);
}

function applyLocalReadStateToItems(items: WorkflowNotificationEvent[], getLocallyReadAdminIds: () => Set<string>) {
  const locallyReadAdminIds = getLocallyReadAdminIds();
  return items.map((item) => {
    if (item.recipientStaffId === "ADMINS" && locallyReadAdminIds.has(item.id)) return { ...item, isRead: true };
    return item;
  });
}

async function executeFetchUnreadIdsForRecipient(recipientStaffId: string) {
  const ids: string[] = [];
  let cursor: string | null = null;
  do {
    const response = (await graphqlClient.graphql({
      query: workflowNotificationEventsByRecipient,
      variables: { recipientStaffId, sortDirection: ModelSortDirection.DESC, limit: 100, nextToken: cursor, filter: { isRead: { eq: false } } },
      authMode: "userPool",
    })) as GraphQLResult<WorkflowNotificationEventsByRecipientQuery>;
    if (response.errors?.length) throw new Error(response.errors[0].message);
    const connection = response.data?.workflowNotificationEventsByRecipient;
    const pageIds = connection?.items.filter((item): item is WorkflowNotificationEvent => Boolean(item)).map((item) => item.id) ?? [];
    ids.push(...pageIds);
    cursor = connection?.nextToken ?? null;
  } while (cursor);
  return ids;
}

async function executeFetchUnreadCountForRecipients(recipientStaffIds: string[], getLocallyReadAdminIds: () => Set<string>, setUnreadCount: (count: number) => void) {
  if (recipientStaffIds.length === 0) { setUnreadCount(0); return; }
  let total = 0;
  for (const recipientStaffId of recipientStaffIds) {
    let recipientTotal = 0;
    let cursor: string | null = null;
    do {
      const response = (await graphqlClient.graphql({
        query: workflowNotificationEventsByRecipient,
        variables: { recipientStaffId, sortDirection: ModelSortDirection.DESC, limit: 100, nextToken: cursor, filter: { isRead: { eq: false } } },
        authMode: "userPool",
      })) as GraphQLResult<WorkflowNotificationEventsByRecipientQuery>;
      if (response.errors?.length) throw new Error(response.errors[0].message);
      const connection = response.data?.workflowNotificationEventsByRecipient;
      const pageItems = connection?.items.filter((item): item is WorkflowNotificationEvent => Boolean(item)) ?? [];
      if (recipientStaffId === "ADMINS") {
        const locallyReadAdminIds = getLocallyReadAdminIds();
        recipientTotal += pageItems.filter((item) => !locallyReadAdminIds.has(item.id)).length;
      } else {
        recipientTotal += pageItems.length;
      }
      cursor = connection?.nextToken ?? null;
    } while (cursor);
    total += recipientTotal;
  }
  setUnreadCount(total);
}

async function executeFetchNotifications(recipientIds: string[], getLocallyReadAdminIds: () => Set<string>, deps: NotificationStateDeps) {
  const { setNotifications, setUnreadCount, setLoading, setError, setNextTokensByRecipient } = deps;
  if (recipientIds.length === 0) { setNotifications([]); setUnreadCount(0); setNextTokensByRecipient({}); return; }
  setLoading(true);
  setError(null);
  try {
    const pages = await Promise.all(
      recipientIds.map(async (recipientId) => {
        const connection = await executeFetchNotificationPage(recipientId);
        const items = connection?.items.filter((item): item is WorkflowNotificationEvent => Boolean(item)) ?? [];
        return { recipientId, items, nextToken: connection?.nextToken ?? null };
      }),
    );
    setNotifications(toUniqueSortedItems(applyLocalReadStateToItems(pages.flatMap((page) => page.items), getLocallyReadAdminIds)));
    setNextTokensByRecipient(pages.reduce<Record<string, string | null>>((acc, page) => { acc[page.recipientId] = page.nextToken; return acc; }, {}));
    await executeFetchUnreadCountForRecipients(recipientIds, getLocallyReadAdminIds, setUnreadCount);
  } catch (fetchError) {
    const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
    setError(message);
    logger.error("Failed to fetch workflow notifications:", message);
  } finally {
    setLoading(false);
  }
}

async function executeLoadMoreNotifications(
  targets: string[],
  nextTokensByRecipient: Record<string, string | null>,
  getLocallyReadAdminIds: () => Set<string>,
  deps: Omit<NotificationStateDeps, "setLoading" | "setUnreadCount"> & { setLoadingMore: Dispatch<SetStateAction<boolean>> },
) {
  const { setNotifications, setError, setNextTokensByRecipient, setLoadingMore } = deps;
  setLoadingMore(true);
  setError(null);
  try {
    const pages = await Promise.all(
      targets.map(async (recipientId) => {
        const connection = await executeFetchNotificationPage(recipientId, { nextToken: nextTokensByRecipient[recipientId] ?? null });
        const items = connection?.items.filter((item): item is WorkflowNotificationEvent => Boolean(item)) ?? [];
        return { recipientId, items, nextToken: connection?.nextToken ?? null };
      }),
    );
    setNotifications((previous) => toUniqueSortedItems(applyLocalReadStateToItems([...previous, ...pages.flatMap((page) => page.items)], getLocallyReadAdminIds)));
    setNextTokensByRecipient((previous) => {
      const next = { ...previous };
      pages.forEach((page) => { next[page.recipientId] = page.nextToken; });
      return next;
    });
  } catch (fetchError) {
    const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
    setError(message);
    logger.error("Failed to load more workflow notifications:", message);
  } finally {
    setLoadingMore(false);
  }
}

function executeApplyIncomingEvent(
  incoming: WorkflowNotificationEvent,
  getLocallyReadAdminIds: () => Set<string>,
  setNotifications: Dispatch<SetStateAction<WorkflowNotificationEvent[]>>,
  setUnreadCount: Dispatch<SetStateAction<number>>,
) {
  const locallyReadAdminIds = getLocallyReadAdminIds();
  const normalizedIncoming = incoming.recipientStaffId === "ADMINS" && locallyReadAdminIds.has(incoming.id)
    ? { ...incoming, isRead: true }
    : incoming;
  setNotifications((previous) => {
    const index = previous.findIndex((item) => item.id === normalizedIncoming.id);
    const previousEvent = index >= 0 ? previous[index] : null;
    if (!previousEvent && !normalizedIncoming.isRead) setUnreadCount((prev) => prev + 1);
    if (previousEvent && previousEvent.isRead && !normalizedIncoming.isRead) setUnreadCount((prev) => prev + 1);
    if (previousEvent && !previousEvent.isRead && normalizedIncoming.isRead) setUnreadCount((prev) => Math.max(prev - 1, 0));
    if (index >= 0) {
      const next = [...previous];
      next[index] = normalizedIncoming;
      return next.toSorted(sortByEventAtDesc);
    }
    return [normalizedIncoming, ...previous].toSorted(sortByEventAtDesc);
  });
}

async function executeMarkAsRead(
  id: string,
  notifications: WorkflowNotificationEvent[],
  markAdminGroupEventAsReadLocally: (eventId: string) => boolean,
  setNotifications: Dispatch<SetStateAction<WorkflowNotificationEvent[]>>,
  setUnreadCount: Dispatch<SetStateAction<number>>,
) {
  const target = notifications.find((notification) => notification.id === id);
  if (target?.recipientStaffId === "ADMINS") {
    const marked = markAdminGroupEventAsReadLocally(id);
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id ? { ...notification, isRead: true, readAt: new Date().toISOString() } : notification,
      ),
    );
    if (marked && !target.isRead) setUnreadCount((prev) => Math.max(prev - 1, 0));
    return;
  }
  const readAt = new Date().toISOString();
  const response = (await graphqlClient.graphql({
    query: updateWorkflowNotificationEvent,
    variables: {
      condition: buildVersionOrUpdatedAtCondition(target?.version, target?.updatedAt),
      input: { id, isRead: true, readAt, version: getNextVersion(target?.version) },
    },
    authMode: "userPool",
  })) as GraphQLResult<UpdateWorkflowNotificationEventMutation>;
  if (response.errors?.length) throw new Error(response.errors[0].message);
  let decremented = false;
  setNotifications((previous) =>
    previous.map((notification) => {
      if (notification.id !== id) return notification;
      if (!notification.isRead) decremented = true;
      return { ...notification, isRead: true, readAt };
    }),
  );
  if (decremented) setUnreadCount((prev) => Math.max(prev - 1, 0));
}

export const useWorkflowNotificationInbox = () => {
  const { authStatus, cognitoUser, isCognitoUserRole } =
    useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs } = useStaffs({ isAuthenticated });

  const [notifications, setNotifications] = useState<
    WorkflowNotificationEvent[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextTokensByRecipient, setNextTokensByRecipient] = useState<
    Record<string, string | null>
  >({});

  const cognitoUserId = cognitoUser?.id ?? null;
  const currentStaffId = useMemo(() => {
    if (!isAuthenticated || !cognitoUserId) return null;
    return (
      staffs.find((staff) => staff.cognitoUserId === cognitoUserId)?.id ?? null
    );
  }, [cognitoUserId, isAuthenticated, staffs]);

  const isAdminWatcher = useMemo(
    () =>
      isCognitoUserRole(StaffRole.ADMIN) ||
      isCognitoUserRole(StaffRole.STAFF_ADMIN) ||
      isCognitoUserRole(StaffRole.OWNER),
    [isCognitoUserRole],
  );

  const recipientIds = useMemo(() => {
    const selfIds = [currentStaffId, cognitoUserId].filter(
      (id): id is string => Boolean(id),
    );

    if (!isAdminWatcher) {
      return selfIds.filter((id, index, list) => list.indexOf(id) === index);
    }

    return [...selfIds, "ADMINS"].filter(
      (id, index, list) => list.indexOf(id) === index,
    );
  }, [cognitoUserId, currentStaffId, isAdminWatcher]);

  const { getLocallyReadAdminIds, markAdminGroupEventAsReadLocally } = useAdminGroupLocalReadState(cognitoUserId ?? undefined);

  const fetchNotifications = useCallback(
    async () => executeFetchNotifications(recipientIds, getLocallyReadAdminIds, { setNotifications, setUnreadCount, setLoading, setError, setNextTokensByRecipient, getLocallyReadAdminIds }),
    [getLocallyReadAdminIds, recipientIds],
  );

  const loadMoreNotifications = useCallback(async () => {
    if (recipientIds.length === 0 || loadingMore) return;
    const targets = recipientIds.filter((id) => Boolean(nextTokensByRecipient[id]));
    if (targets.length === 0) return;
    await executeLoadMoreNotifications(targets, nextTokensByRecipient, getLocallyReadAdminIds, { setNotifications, setError, setNextTokensByRecipient, getLocallyReadAdminIds, setLoadingMore });
  }, [getLocallyReadAdminIds, loadingMore, nextTokensByRecipient, recipientIds]);

  const applyIncomingEvent = useCallback(
    (incoming: WorkflowNotificationEvent) => executeApplyIncomingEvent(incoming, getLocallyReadAdminIds, setNotifications, setUnreadCount),
    [getLocallyReadAdminIds],
  );

  const markAsRead = useCallback(
    async (id: string) => executeMarkAsRead(id, notifications, markAdminGroupEventAsReadLocally, setNotifications, setUnreadCount),
    [markAdminGroupEventAsReadLocally, notifications],
  );

  const markAllAsRead = useCallback(async () => {
    const unreadIdsByRecipient = await Promise.all(recipientIds.map((id) => executeFetchUnreadIdsForRecipient(id)));
    const unreadIds = [...new Set(unreadIdsByRecipient.flat())];
    await Promise.all(unreadIds.map((id) => markAsRead(id)));
    setNotifications((previous) => previous.map((notification) => ({ ...notification, isRead: true })));
    await executeFetchUnreadCountForRecipients(recipientIds, getLocallyReadAdminIds, setUnreadCount);
  }, [getLocallyReadAdminIds, markAsRead, recipientIds]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (recipientIds.length === 0) {
      return;
    }

    const subscriptions = recipientIds.flatMap((recipientStaffId) => {
      const filter = {
        recipientStaffId: { eq: recipientStaffId },
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
            logger.error("Create workflow notification subscription error:", {
              recipientStaffId,
              subscriptionError,
            });
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
            logger.error("Update workflow notification subscription error:", {
              recipientStaffId,
              subscriptionError,
            });
          },
        });

      return [createSubscription, updateSubscription];
    });

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [applyIncomingEvent, recipientIds]);

  return {
    currentStaffId,
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore: Object.values(nextTokensByRecipient).some((value) =>
      Boolean(value),
    ),
    error,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
  };
};
