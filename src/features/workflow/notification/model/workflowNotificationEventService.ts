import type { GetWorkflowQuery } from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("workflowNotificationEventService");

export type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

export type NotificationStaff = {
  id: string;
  role?: string | null;
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

const normalizeApproverId = (approverId?: string | null) =>
  (approverId ?? "").trim();

const isAdminRole = (role?: string | null) => (role ?? "") === "ADMIN";

const collectWorkflowParticipantIds = (
  workflow: WorkflowData,
  staffs: NotificationStaff[],
) => {
  const participantIds = new Set<string>();

  participantIds.add(workflow.staffId);

  (workflow.assignedApproverStaffIds ?? []).forEach((approverId) => {
    const normalized = normalizeApproverId(approverId);
    if (!normalized) return;

    if (normalized === "ADMINS") {
      staffs
        .filter((staff) => isAdminRole(staff.role))
        .forEach((admin) => {
          participantIds.add(admin.id);
        });
      return;
    }

    participantIds.add(normalized);
  });

  (workflow.approvalSteps ?? []).forEach((step) => {
    const normalized = normalizeApproverId(step?.approverStaffId);
    if (!normalized) return;

    if (normalized === "ADMINS") {
      staffs
        .filter((staff) => isAdminRole(staff.role))
        .forEach((admin) => {
          participantIds.add(admin.id);
        });
      return;
    }

    participantIds.add(normalized);
  });

  return participantIds;
};

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
  const recipients = collectWorkflowParticipantIds(workflow, staffs);
  recipients.delete(actorStaffId);

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
  workflowId: string;
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
  const observable = graphqlClient.graphql({
    query: onCreateWorkflowNotificationEvent,
    variables: {
      filter: {
        workflowId: { eq: workflowId },
        recipientStaffId: { eq: recipientStaffId },
        eventType: { eq: "WORKFLOW_COMMENT" },
      },
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
