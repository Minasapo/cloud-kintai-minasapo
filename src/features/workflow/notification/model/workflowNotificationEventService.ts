import type { GetWorkflowQuery } from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("workflowNotificationEventService");

export type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

export type NotificationStaff = {
  id: string;
  cognitoUserId?: string | null;
  familyName?: string | null;
  givenName?: string | null;
  mailAddress?: string | null;
  role?: string | null;
  shiftGroup?: string | null;
  workType?: string | null;
};

type CreateWorkflowNotificationEventMutation = {
  createWorkflowNotificationEvent?: {
    id: string;
  } | null;
};

type OnCreateWorkflowNotificationEventSubscription = {
  onCreateWorkflowNotificationEvent?: {
    id: string;
    recipientStaffId: string;
    actorStaffId: string;
    workflowId: string;
    eventType: "WORKFLOW_COMMENT";
    commentId?: string | null;
    title: string;
    body: string;
    isRead: boolean;
    readAt?: string | null;
    eventAt: string;
  } | null;
};

type WorkflowNotificationSubscriptionPayload = {
  data?: OnCreateWorkflowNotificationEventSubscription;
};

type WorkflowNotificationSubscription = {
  unsubscribe: () => void;
};

type WorkflowNotificationObservable = {
  subscribe: (observer: {
    next: (payload: WorkflowNotificationSubscriptionPayload) => void;
    error: (error: unknown) => void;
  }) => WorkflowNotificationSubscription;
};

const createWorkflowNotificationEvent = /* GraphQL */ `
  mutation CreateWorkflowNotificationEvent(
    $input: CreateWorkflowNotificationEventInput!
  ) {
    createWorkflowNotificationEvent(input: $input) {
      id
    }
  }
`;

const onCreateWorkflowNotificationEvent = /* GraphQL */ `
  subscription OnCreateWorkflowNotificationEvent(
    $filter: ModelSubscriptionWorkflowNotificationEventFilterInput
  ) {
    onCreateWorkflowNotificationEvent(filter: $filter) {
      id
      recipientStaffId
      actorStaffId
      workflowId
      eventType
      commentId
      title
      body
      isRead
      readAt
      eventAt
    }
  }
`;

const normalizeRole = (role?: string | null) =>
  (role ?? "")
    .trim()
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();

const isAdminRole = (role?: string | null) => {
  const normalized = normalizeRole(role);
  return (
    normalized === "ADMIN" ||
    normalized === "STAFFADMIN" ||
    normalized === "OWNER"
  );
};

const normalizeRecipientId = (id?: string | null) => (id ?? "").trim();

type PublishWorkflowCommentNotificationsArgs = {
  workflow: WorkflowData;
  actorStaffId: string;
  actorDisplayName: string;
  commentId: string;
  staffs: NotificationStaff[];
};

export const publishWorkflowCommentNotifications = async ({
  workflow,
  actorStaffId,
  actorDisplayName,
  commentId,
  staffs,
}: PublishWorkflowCommentNotificationsArgs) => {
  const actor = staffs.find((staff) => staff.id === actorStaffId);
  const actorIsAdmin = isAdminRole(actor?.role);

  const recipients = new Set<string>();
  if (actorIsAdmin) {
    const applicantId = normalizeRecipientId(workflow.staffId);
    if (applicantId && applicantId !== actorStaffId) {
      recipients.add(applicantId);
    }
  } else {
    recipients.add("ADMINS");
  }

  if (recipients.size === 0) {
    return;
  }

  const eventAt = new Date().toISOString();
  const tasks = [...recipients].map(async (recipientStaffId) => {
    const response = (await graphqlClient.graphql({
      query: createWorkflowNotificationEvent,
      variables: {
        input: {
          recipientStaffId,
          actorStaffId,
          workflowId: workflow.id,
          eventType: "WORKFLOW_COMMENT",
          commentId,
          title: "新着コメントがあります",
          body: `${actorDisplayName}さんがコメントを投稿しました`,
          isRead: false,
          eventAt,
        },
      },
      authMode: "userPool",
    })) as GraphQLResult<CreateWorkflowNotificationEventMutation>;

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  });

  const result = await Promise.allSettled(tasks);
  result.forEach((entry, index) => {
    if (entry.status === "rejected") {
      logger.warn("Failed to publish workflow comment notification", {
        workflowId: workflow.id,
        recipientStaffId: [...recipients][index],
        reason:
          entry.reason instanceof Error
            ? entry.reason.message
            : String(entry.reason),
      });
    }
  });
};

type SubscribeWorkflowCommentNotificationsArgs = {
  workflowId?: string;
  recipientStaffId: string;
  onReceived: (
    event: NonNullable<
      OnCreateWorkflowNotificationEventSubscription["onCreateWorkflowNotificationEvent"]
    >,
  ) => void;
  onError?: (error: unknown) => void;
};

export const subscribeWorkflowCommentNotifications = ({
  workflowId,
  recipientStaffId,
  onReceived,
  onError,
}: SubscribeWorkflowCommentNotificationsArgs) => {
  const filter: Record<string, unknown> = {
    recipientStaffId: { eq: recipientStaffId },
    eventType: { eq: "WORKFLOW_COMMENT" },
  };

  if (workflowId) {
    filter.workflowId = { eq: workflowId };
  }

  const observable = graphqlClient.graphql({
    query: onCreateWorkflowNotificationEvent,
    variables: {
      filter,
    },
    authMode: "userPool",
  }) as WorkflowNotificationObservable;

  const subscription = observable.subscribe({
    next: ({ data }: WorkflowNotificationSubscriptionPayload) => {
      if (!data?.onCreateWorkflowNotificationEvent) return;
      onReceived(data.onCreateWorkflowNotificationEvent);
    },
    error: (error: unknown) => {
      if (onError) {
        onError(error);
        return;
      }
      logger.error("Workflow notification subscription error:", error);
    },
  });

  return () => {
    subscription.unsubscribe();
  };
};
