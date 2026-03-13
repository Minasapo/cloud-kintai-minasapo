import {
  StaffRole,
  useStaffs,
} from "@entities/staff/model/useStaffs/useStaffs";
import { onCreateWorkflow } from "@shared/api/graphql/documents/subscriptions";
import {
  OnCreateWorkflowSubscription,
  WorkflowCategory,
} from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { useCallback, useContext, useEffect, useMemo } from "react";

import { AuthContext } from "@/context/AuthContext";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

import { useLocalNotification } from "./useLocalNotification";

const logger = createLogger("useWorkflowNotification");

/**
 * ワークフローカテゴリーのラベルマップ
 */
const WORKFLOW_CATEGORY_LABELS: Record<WorkflowCategory, string> = {
  [WorkflowCategory.PAID_LEAVE]: "有給休暇申請",
  [WorkflowCategory.ABSENCE]: "欠勤申請",
  [WorkflowCategory.OVERTIME]: "時間外勤務申請",
  [WorkflowCategory.CLOCK_CORRECTION]: "勤怠修正申請",
  [WorkflowCategory.CUSTOM]: "その他申請",
};

/**
 * ワークフローの新規作成を購読し、自分が承認者として割り当てられている場合に通知を表示するフック
 */
export const useWorkflowNotification = (enabled = true) => {
  const { authStatus, cognitoUser } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated" && enabled;
  const { staffs } = useStaffs({ isAuthenticated });
  const { notify, canNotify } = useLocalNotification();

  // 現在のスタッフIDを取得
  const currentStaffId = useMemo(() => {
    if (!cognitoUser?.id || !isAuthenticated) {
      logger.debug("No cognitoUser or not authenticated");
      return null;
    }
    const staff = staffs.find((s) => s.cognitoUserId === cognitoUser.id);
    const staffId = staff?.id ?? null;
    logger.info("Current staff ID:", {
      cognitoUserId: cognitoUser.id,
      staffId,
      staffRole: staff?.role,
    });
    return staffId;
  }, [cognitoUser, staffs, isAuthenticated]);

  // 申請者の名前を取得
  const getStaffName = useCallback(
    (staffId: string): string => {
      const staff = staffs.find((s) => s.id === staffId);
      if (!staff) return "スタッフ";
      return (
        `${staff.familyName || ""}${staff.givenName || ""}`.trim() || "スタッフ"
      );
    },
    [staffs],
  );

  // カテゴリーラベルを取得
  const getCategoryLabel = useCallback(
    (workflow: OnCreateWorkflowSubscription["onCreateWorkflow"]): string => {
      if (!workflow) return "申請";

      // カスタムワークフローの場合はタイトルを使用
      if (
        workflow.category === WorkflowCategory.CUSTOM &&
        workflow.customWorkflowTitle
      ) {
        return workflow.customWorkflowTitle;
      }

      // それ以外はカテゴリーラベルを使用
      return workflow.category
        ? WORKFLOW_CATEGORY_LABELS[workflow.category] || "申請"
        : "申請";
    },
    [],
  );

  // 自分が承認者として割り当てられているかチェック
  const isAssignedAsApprover = useCallback(
    (workflow: OnCreateWorkflowSubscription["onCreateWorkflow"]): boolean => {
      if (!workflow || !currentStaffId) {
        logger.debug("No workflow or currentStaffId", {
          hasWorkflow: !!workflow,
          currentStaffId,
        });
        return false;
      }

      logger.info("Checking approver assignment:", {
        workflowId: workflow.id,
        currentStaffId,
        assignedApproverStaffIds: workflow.assignedApproverStaffIds,
      });

      // assignedApproverStaffIds に含まれているかチェック
      if (workflow.assignedApproverStaffIds) {
        if (workflow.assignedApproverStaffIds.includes(currentStaffId)) {
          logger.info("User is directly assigned as approver");
          return true;
        }

        // "ADMINS" が含まれており、現在のユーザーが管理者の場合
        if (workflow.assignedApproverStaffIds.includes("ADMINS")) {
          const currentStaff = staffs.find((s) => s.id === currentStaffId);
          logger.info("ADMINS group check:", {
            currentStaffRole: currentStaff?.role,
            isAdmin: currentStaff?.role === StaffRole.ADMIN,
          });
          if (currentStaff?.role === StaffRole.ADMIN) {
            logger.info("User is admin and ADMINS group is assigned");
            return true;
          }
        }
      }

      logger.info("User is not assigned as approver");
      return false;
    },
    [currentStaffId, staffs],
  );

  // ワークフロー作成時の通知ハンドラー
  const handleWorkflowCreated = useCallback(
    async (workflow: OnCreateWorkflowSubscription["onCreateWorkflow"]) => {
      logger.info("handleWorkflowCreated called:", {
        workflowId: workflow?.id,
        canNotify,
        currentStaffId,
      });

      if (!workflow) {
        logger.warn("No workflow data");
        return;
      }

      if (!canNotify) {
        logger.warn("Cannot notify - notification permission not granted");
        return;
      }

      // 自分が申請者の場合は通知不要
      if (workflow.staffId === currentStaffId) {
        logger.info("Skipping notification - user is the submitter");
        return;
      }

      // 自分が承認者として割り当てられていない場合は通知不要
      const isApprover = isAssignedAsApprover(workflow);
      if (!isApprover) {
        logger.info("Skipping notification - user is not assigned as approver");
        return;
      }

      try {
        const submitterName = getStaffName(workflow.staffId);
        const categoryLabel = getCategoryLabel(workflow);

        logger.info("Showing notification:", {
          submitterName,
          categoryLabel,
        });

        await notify("新しい申請があります", {
          body: `${submitterName} さんから${categoryLabel}が作成されました`,
          tag: `workflow-${workflow.id}`,
          mode: "await-interaction",
          priority: "high",
          requireInteraction: true,
          icon: "📋",
        });

        logger.info("Workflow notification sent successfully:", {
          workflowId: workflow.id,
          category: workflow.category,
          submitter: workflow.staffId,
        });
      } catch (error) {
        logger.error("Failed to show workflow notification:", error);
      }
    },
    [
      canNotify,
      currentStaffId,
      isAssignedAsApprover,
      getStaffName,
      getCategoryLabel,
      notify,
    ],
  );

  // ワークフロー作成のサブスクリプションを購読
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      logger.debug("Not authenticated, skipping subscription");
      return;
    }

    if (!currentStaffId) {
      logger.debug("No currentStaffId, skipping subscription");
      return;
    }

    logger.info("Starting workflow subscription for staff:", {
      currentStaffId,
      isAuthenticated,
    });

    const subscription = graphqlClient
      .graphql({
        query: onCreateWorkflow,
      })
      .subscribe({
        next: ({ data }) => {
          logger.info("Subscription received data:", {
            hasData: !!data,
            hasWorkflow: !!data?.onCreateWorkflow,
          });

          if (!data?.onCreateWorkflow) {
            logger.warn("No workflow data in subscription");
            return;
          }

          logger.info("Workflow created event received:", {
            id: data.onCreateWorkflow.id,
            category: data.onCreateWorkflow.category,
            staffId: data.onCreateWorkflow.staffId,
            assignedApproverStaffIds:
              data.onCreateWorkflow.assignedApproverStaffIds,
          });

          void handleWorkflowCreated(data.onCreateWorkflow);
        },
        error: (error) => {
          logger.error("Workflow subscription error:", error);
        },
      });

    return () => {
      logger.info("Unsubscribing from workflow subscription");
      subscription.unsubscribe();
    };
  }, [enabled, isAuthenticated, currentStaffId, handleWorkflowCreated]);

  return {
    isSubscribed: enabled && isAuthenticated && !!currentStaffId,
  };
};
