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
  const [category, setCategory] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [draftMode, setDraftMode] = useState(true);
  const [applicant, setApplicant] = useState<StaffType | null>(null);
  const [existingComments, setExistingComments] = useState<
    WorkflowCommentInput[]
  >([]);

  // 初期フィールド値を workflow から解決
  const initialFields = useMemo(
    () => initDynamicFieldsFromWorkflow(resolveCategoryLabel(workflow), workflow),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workflow.id],
  );

  const { fields, setFieldValue, resetFields, isDirty } =
    useDynamicWorkflowForm({ initialFields });

  useEffect(() => {
    const nextCategoryLabel = resolveCategoryLabel(workflow);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategory(nextCategoryLabel);

    const appDate =
      workflow.overTimeDetails?.date ||
      isoDateFromTimestamp(workflow.createdAt);
    setApplicationDate(formatDateSlash(appDate));

    resetFields(
      initDynamicFieldsFromWorkflow(nextCategoryLabel, workflow),
    );

    setDraftMode(workflow.status === WorkflowStatus.DRAFT);
    setExistingComments(extractExistingWorkflowComments(workflow));
  }, [workflow, resetFields]);

  useEffect(() => {
    if (!workflow.staffId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setApplicant(null);
      return;
    }
    const match = staffs.find((s) => s.id === workflow.staffId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApplicant(
      match ||
        ({
          id: workflow.staffId,
          familyName: "",
          givenName: "",
        } as StaffType),
    );
  }, [workflow.staffId, staffs]);

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
