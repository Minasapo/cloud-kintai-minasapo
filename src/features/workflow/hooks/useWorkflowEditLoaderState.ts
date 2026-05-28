import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import {
  CATEGORY_LABELS,
  resolveClockCorrectionLabel,
} from "@entities/workflow/lib/workflowLabels";
import { initDynamicFieldsFromWorkflow } from "@features/workflow/application-form/model/initDynamicFields";
import { useDynamicWorkflowForm } from "@features/workflow/application-form/model/useDynamicWorkflowForm";
import { extractExistingWorkflowComments } from "@features/workflow/comment-thread/model/workflowCommentBuilder";
import type { WorkflowEntity } from "@features/workflow/hooks/useWorkflowLoaderWorkflow";
import {
  WorkflowCategory,
  type WorkflowCommentInput,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import {
  formatDateSlash,
  isoDateFromTimestamp,
} from "@shared/lib/time";
import { useEffect, useMemo, useState } from "react";

export type WorkflowEditLoaderState = {
  category: string;
  setCategory: (value: string) => void;
  applicationDate: string;
  fields: Record<string, unknown>;
  setFieldValue: (key: string, value: unknown) => void;
  resetFields: (newFields?: Record<string, unknown>) => void;
  draftMode: boolean;
  setDraftMode: (value: boolean) => void;
  applicant: StaffType | null;
  existingComments: WorkflowCommentInput[];
  setExistingComments: (comments: WorkflowCommentInput[]) => void;
  isDirty: boolean;
};

const resolveCategoryLabel = (workflow: WorkflowEntity): string => {
  if (!workflow.category) return "";
  if (workflow.category === WorkflowCategory.CLOCK_CORRECTION) {
    return resolveClockCorrectionLabel(workflow.overTimeDetails?.reason);
  }
  return (
    CATEGORY_LABELS[workflow.category as WorkflowCategory] || workflow.category
  );
};

export function useWorkflowEditLoaderState(
  workflow: WorkflowEntity,
  staffs: StaffType[],
): WorkflowEditLoaderState {
  const workflowKey = workflow.id || "__unknown-workflow";

  const [categoryOverrides, setCategoryOverrides] = useState<
    Record<string, string>
  >({});
  const [draftModeOverrides, setDraftModeOverrides] = useState<
    Record<string, boolean>
  >({});
  const [existingCommentOverrides, setExistingCommentOverrides] = useState<
    Record<string, WorkflowCommentInput[]>
  >({});

  const categoryFromWorkflow = useMemo(
    () => resolveCategoryLabel(workflow),
    [workflow],
  );
  const category = categoryOverrides[workflowKey] ?? categoryFromWorkflow;
  const setCategory = (value: string) => {
    setCategoryOverrides((prev) => ({ ...prev, [workflowKey]: value }));
  };

  const applicationDate = useMemo(() => {
    const appDate =
      workflow.overTimeDetails?.date ||
      isoDateFromTimestamp(workflow.createdAt);
    return formatDateSlash(appDate);
  }, [workflow]);

  const applicant = useMemo(() => {
    if (!workflow.staffId) return null;
    const match = staffs.find((s) => s.id === workflow.staffId);
    return (
      match ||
      ({
        id: workflow.staffId,
        familyName: "",
        givenName: "",
      } as StaffType)
    );
  }, [workflow.staffId, staffs]);

  const draftModeFromWorkflow = workflow.status === WorkflowStatus.DRAFT;
  const draftMode = draftModeOverrides[workflowKey] ?? draftModeFromWorkflow;
  const setDraftMode = (value: boolean) => {
    setDraftModeOverrides((prev) => ({ ...prev, [workflowKey]: value }));
  };

  const existingCommentsFromWorkflow = useMemo(
    () => extractExistingWorkflowComments(workflow),
    [workflow],
  );
  const existingComments =
    existingCommentOverrides[workflowKey] ?? existingCommentsFromWorkflow;
  const setExistingComments = (comments: WorkflowCommentInput[]) => {
    setExistingCommentOverrides((prev) => ({ ...prev, [workflowKey]: comments }));
  };

  // 初期フィールド値を workflow から解決
  const initialFields = useMemo(
    () => initDynamicFieldsFromWorkflow(categoryFromWorkflow, workflow),
    [categoryFromWorkflow, workflow],
  );

  const { fields, setFieldValue, resetFields, isDirty } =
    useDynamicWorkflowForm({ initialFields });

  useEffect(() => {
    resetFields(initialFields);
  }, [initialFields, resetFields]);

  return {
    category,
    setCategory,
    applicationDate,
    fields,
    setFieldValue,
    resetFields,
    draftMode,
    setDraftMode,
    applicant,
    existingComments,
    setExistingComments,
    isDirty,
  };
}
