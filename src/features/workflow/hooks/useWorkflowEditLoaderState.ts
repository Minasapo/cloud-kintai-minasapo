import {
  WorkflowCategory,
  type WorkflowCommentInput,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import { useEffect, useState } from "react";

import { extractExistingWorkflowComments } from "@/features/workflow/comment-thread/model/workflowCommentBuilder";
import type { WorkflowEntity } from "@/features/workflow/hooks/useWorkflowLoaderWorkflow";
import type { StaffType } from "@/hooks/useStaffs/useStaffs";
import { formatDateSlash, isoDateFromTimestamp } from "@/lib/date";
import { CATEGORY_LABELS } from "@/lib/workflowLabels";

export type WorkflowEditLoaderState = {
  category: string;
  setCategory: (value: string) => void;
  applicationDate: string;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  absenceDate: string;
  setAbsenceDate: (value: string) => void;
  paidReason: string;
  setPaidReason: (value: string) => void;
  overtimeDate: string;
  setOvertimeDate: (value: string) => void;
  overtimeStart: string;
  setOvertimeStart: (value: string) => void;
  overtimeEnd: string;
  setOvertimeEnd: (value: string) => void;
  overtimeReason: string;
  setOvertimeReason: (value: string) => void;
  draftMode: boolean;
  setDraftMode: (value: boolean) => void;
  applicant: StaffType | null;
  existingComments: WorkflowCommentInput[];
  setExistingComments: (comments: WorkflowCommentInput[]) => void;
};

export function useWorkflowEditLoaderState(
  workflow: WorkflowEntity,
  staffs: StaffType[]
): WorkflowEditLoaderState {
  const [category, setCategory] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [absenceDate, setAbsenceDate] = useState("");
  const [paidReason, setPaidReason] = useState("");
  const [overtimeDate, setOvertimeDate] = useState("");
  const [overtimeStart, setOvertimeStart] = useState("");
  const [overtimeEnd, setOvertimeEnd] = useState("");
  const [overtimeReason, setOvertimeReason] = useState("");
  const [draftMode, setDraftMode] = useState(true);
  const [applicant, setApplicant] = useState<StaffType | null>(null);
  const [existingComments, setExistingComments] = useState<
    WorkflowCommentInput[]
  >([]);

  useEffect(() => {
    const nextCategoryLabel = workflow.category
      ? CATEGORY_LABELS[workflow.category as WorkflowCategory] ||
        workflow.category
      : "";
    setCategory(nextCategoryLabel);

    const appDate =
      workflow.overTimeDetails?.date ||
      isoDateFromTimestamp(workflow.createdAt);
    setApplicationDate(formatDateSlash(appDate));

    if (workflow.overTimeDetails) {
      setOvertimeDate(isoDateFromTimestamp(workflow.overTimeDetails.date));
      setOvertimeStart(workflow.overTimeDetails.startTime || "");
      setOvertimeEnd(workflow.overTimeDetails.endTime || "");
      setOvertimeReason(workflow.overTimeDetails.reason || "");
    } else {
      setOvertimeDate("");
      setOvertimeStart("");
      setOvertimeEnd("");
      setOvertimeReason("");
    }

    setDraftMode(workflow.status === WorkflowStatus.DRAFT);
    setExistingComments(extractExistingWorkflowComments(workflow));
  }, [workflow]);

  useEffect(() => {
    if (!workflow.staffId) {
      setApplicant(null);
      return;
    }
    const match = staffs.find((s) => s.id === workflow.staffId);
    setApplicant(
      match ||
        ({
          id: workflow.staffId,
          familyName: "",
          givenName: "",
        } as StaffType)
    );
  }, [workflow.staffId, staffs]);

  return {
    category,
    setCategory,
    applicationDate,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    absenceDate,
    setAbsenceDate,
    paidReason,
    setPaidReason,
    overtimeDate,
    setOvertimeDate,
    overtimeStart,
    setOvertimeStart,
    overtimeEnd,
    setOvertimeEnd,
    overtimeReason,
    setOvertimeReason,
    draftMode,
    setDraftMode,
    applicant,
    existingComments,
    setExistingComments,
  };
}
