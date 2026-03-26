import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { createContext, useContext } from "react";

import type { WorkflowApprovalStepView } from "@/features/workflow/approval-flow/types";
import type { WorkflowCommentMessage } from "@/features/workflow/comment-thread/types";
import type { WorkflowEntity } from "@/features/workflow/hooks/useWorkflowLoaderWorkflow";

import type { WorkflowDetailPermissions } from "./workflowDetailPermissions";

type WorkflowDetailContextValue = {
  // ワークフローデータ
  workflow: WorkflowEntity | null | undefined;
  id: string | undefined;
  staffs: StaffType[];
  // メタ情報
  staffName: string;
  applicationDate: string;
  categoryLabel: string;
  approvalSteps: WorkflowApprovalStepView[];
  // アクション
  permissions: WorkflowDetailPermissions;
  onBack: () => void;
  onWithdraw: () => void;
  onEdit: () => void;
  // コメントスレッド
  currentStaff: StaffType | undefined;
  messages: WorkflowCommentMessage[];
  expandedMessages: Record<string, boolean>;
  toggleExpanded: (id: string) => void;
  input: string;
  setInput: (value: string) => void;
  sending: boolean;
  formatSender: (sender?: string) => string;
  sendMessage: () => void;
};

export const WorkflowDetailContext =
  createContext<WorkflowDetailContextValue | null>(null);

export function useWorkflowDetailContext(): WorkflowDetailContextValue {
  const ctx = useContext(WorkflowDetailContext);
  if (!ctx) {
    throw new Error(
      "useWorkflowDetailContext must be used within WorkflowDetailContext.Provider",
    );
  }
  return ctx;
}
