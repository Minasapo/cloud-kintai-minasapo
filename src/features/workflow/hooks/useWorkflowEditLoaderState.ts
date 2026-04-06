import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import {
  WorkflowCategory,
  type WorkflowCommentInput,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import { useEffect, useMemo, useState } from "react";

import {
  CATEGORY_LABELS,
  resolveClockCorrectionLabel,
} from "@/entities/workflow/lib/workflowLabels";
import { extractExistingWorkflowComments } from "@/features/workflow/comment-thread/model/workflowCommentBuilder";
import type { WorkflowEntity } from "@/features/workflow/hooks/useWorkflowLoaderWorkflow";
import {
  formatDateSlash,
  isoDateFromTimestamp,
  parseTimeToISO,
} from "@/shared/lib/time";

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
  absenceReason: string;
  setAbsenceReason: (value: string) => void;
  paidReason: string;
  setPaidReason: (value: string) => void;
  overtimeDate: string;
  setOvertimeDate: (value: string) => void;
  overtimeStart: string | null;
  setOvertimeStart: (value: string | null) => void;
  overtimeEnd: string | null;
  setOvertimeEnd: (value: string | null) => void;
  overtimeReason: string;
  setOvertimeReason: (value: string) => void;
  customWorkflowTitle: string;
  setCustomWorkflowTitle: (value: string) => void;
  customWorkflowContent: string;
  setCustomWorkflowContent: (value: string) => void;
  draftMode: boolean;
  setDraftMode: (value: boolean) => void;
  applicant: StaffType | null;
  existingComments: WorkflowCommentInput[];
  setExistingComments: (comments: WorkflowCommentInput[]) => void;
  isDirty: boolean;
};

export function useWorkflowEditLoaderState(
  workflow: WorkflowEntity,
  staffs: StaffType[],
): WorkflowEditLoaderState {
  const [category, setCategory] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [absenceDate, setAbsenceDate] = useState("");
  const [absenceReason, setAbsenceReason] = useState("");
  const [paidReason, setPaidReason] = useState("");
  const [overtimeDate, setOvertimeDate] = useState("");
  const [overtimeStart, setOvertimeStart] = useState<string | null>(null);
  const [overtimeEnd, setOvertimeEnd] = useState<string | null>(null);
  const [overtimeReason, setOvertimeReason] = useState("");
  const [customWorkflowTitle, setCustomWorkflowTitle] = useState("");
  const [customWorkflowContent, setCustomWorkflowContent] = useState("");
  const [draftMode, setDraftMode] = useState(true);
  const [applicant, setApplicant] = useState<StaffType | null>(null);
  const [existingComments, setExistingComments] = useState<
    WorkflowCommentInput[]
  >([]);

  const initialState = useMemo(
    () => ({
      category: workflow.category
        ? workflow.category === WorkflowCategory.CLOCK_CORRECTION
          ? resolveClockCorrectionLabel(workflow.overTimeDetails?.reason)
          : CATEGORY_LABELS[workflow.category as WorkflowCategory] ||
            workflow.category
        : "",
      startDate:
        workflow.category === WorkflowCategory.PAID_LEAVE
          ? workflow.overTimeDetails?.startTime || ""
          : "",
      endDate:
        workflow.category === WorkflowCategory.PAID_LEAVE
          ? workflow.overTimeDetails?.endTime || ""
          : "",
      absenceDate:
        workflow.category === WorkflowCategory.ABSENCE &&
        workflow.overTimeDetails?.date
          ? isoDateFromTimestamp(workflow.overTimeDetails.date)
          : "",
      absenceReason:
        workflow.category === WorkflowCategory.ABSENCE
          ? workflow.overTimeDetails?.reason || ""
          : "",
      paidReason:
        workflow.category === WorkflowCategory.PAID_LEAVE
          ? workflow.overTimeDetails?.reason || ""
          : "",
      overtimeDate:
        workflow.category === WorkflowCategory.OVERTIME ||
        workflow.category === WorkflowCategory.CLOCK_CORRECTION
          ? isoDateFromTimestamp(workflow.overTimeDetails?.date)
          : "",
      overtimeStart:
        workflow.category === WorkflowCategory.OVERTIME ||
        workflow.category === WorkflowCategory.CLOCK_CORRECTION
          ? workflow.overTimeDetails?.startTime
            ? parseTimeToISO(
                workflow.overTimeDetails.startTime,
                isoDateFromTimestamp(workflow.overTimeDetails?.date),
              )
            : null
          : null,
      overtimeEnd:
        workflow.category === WorkflowCategory.OVERTIME ||
        workflow.category === WorkflowCategory.CLOCK_CORRECTION
          ? workflow.overTimeDetails?.endTime
            ? parseTimeToISO(
                workflow.overTimeDetails.endTime,
                isoDateFromTimestamp(workflow.overTimeDetails?.date),
              )
            : null
          : null,
      overtimeReason:
        workflow.category === WorkflowCategory.OVERTIME ||
        workflow.category === WorkflowCategory.CLOCK_CORRECTION
          ? workflow.overTimeDetails?.reason || ""
          : "",
      customWorkflowTitle: workflow.customWorkflowTitle || "",
      customWorkflowContent: workflow.customWorkflowContent || "",
      draftMode: workflow.status === WorkflowStatus.DRAFT,
    }),
    [workflow],
  );

  useEffect(() => {
    const nextCategoryLabel = workflow.category
      ? workflow.category === WorkflowCategory.CLOCK_CORRECTION
        ? resolveClockCorrectionLabel(workflow.overTimeDetails?.reason)
        : CATEGORY_LABELS[workflow.category as WorkflowCategory] ||
          workflow.category
      : "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategory(nextCategoryLabel);

    const appDate =
      workflow.overTimeDetails?.date ||
      isoDateFromTimestamp(workflow.createdAt);
    setApplicationDate(formatDateSlash(appDate));

    if (workflow.overTimeDetails) {
      const overtimeDate = isoDateFromTimestamp(workflow.overTimeDetails.date);

      // 有給休暇申請の場合
      if (workflow.category === WorkflowCategory.PAID_LEAVE) {
        setStartDate(workflow.overTimeDetails.startTime || "");
        setEndDate(workflow.overTimeDetails.endTime || "");
        setPaidReason(workflow.overTimeDetails.reason || "");
      }
      // 欠勤申請の場合
      else if (workflow.category === WorkflowCategory.ABSENCE) {
        setAbsenceDate(overtimeDate);
        setAbsenceReason(workflow.overTimeDetails.reason || "");
      }
      // 残業申請の場合
      else if (workflow.category === WorkflowCategory.OVERTIME) {
        setOvertimeDate(overtimeDate);

        // HH:mm形式をISO形式に変換
        const startTime = workflow.overTimeDetails.startTime;
        const endTime = workflow.overTimeDetails.endTime;
        setOvertimeStart(
          startTime ? parseTimeToISO(startTime, overtimeDate) : null,
        );
        setOvertimeEnd(endTime ? parseTimeToISO(endTime, overtimeDate) : null);
        setOvertimeReason(workflow.overTimeDetails.reason || "");
      }
      // 打刻修正の場合
      else if (workflow.category === WorkflowCategory.CLOCK_CORRECTION) {
        setOvertimeDate(overtimeDate);

        // HH:mm形式をISO形式に変換
        const startTime = workflow.overTimeDetails.startTime;
        const endTime = workflow.overTimeDetails.endTime;
        setOvertimeStart(
          startTime ? parseTimeToISO(startTime, overtimeDate) : null,
        );
        setOvertimeEnd(endTime ? parseTimeToISO(endTime, overtimeDate) : null);
        setOvertimeReason(workflow.overTimeDetails.reason || "");
      }
    } else {
      setOvertimeDate("");
      setOvertimeStart(null);
      setOvertimeEnd(null);
      setOvertimeReason("");
    }

    setCustomWorkflowTitle(workflow.customWorkflowTitle || "");
    setCustomWorkflowContent(workflow.customWorkflowContent || "");

    setDraftMode(workflow.status === WorkflowStatus.DRAFT);
    setExistingComments(extractExistingWorkflowComments(workflow));
  }, [workflow]);

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

  const isDirty = useMemo(
    () =>
      category !== initialState.category ||
      startDate !== initialState.startDate ||
      endDate !== initialState.endDate ||
      absenceDate !== initialState.absenceDate ||
      absenceReason !== initialState.absenceReason ||
      paidReason !== initialState.paidReason ||
      overtimeDate !== initialState.overtimeDate ||
      overtimeStart !== initialState.overtimeStart ||
      overtimeEnd !== initialState.overtimeEnd ||
      overtimeReason !== initialState.overtimeReason ||
      customWorkflowTitle !== initialState.customWorkflowTitle ||
      customWorkflowContent !== initialState.customWorkflowContent ||
      draftMode !== initialState.draftMode,
    [
      absenceDate,
      absenceReason,
      category,
      customWorkflowContent,
      customWorkflowTitle,
      draftMode,
      endDate,
      initialState,
      overtimeDate,
      overtimeEnd,
      overtimeReason,
      overtimeStart,
      paidReason,
      startDate,
    ],
  );

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
    absenceReason,
    setAbsenceReason,
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
    customWorkflowTitle,
    setCustomWorkflowTitle,
    customWorkflowContent,
    setCustomWorkflowContent,
    draftMode,
    setDraftMode,
    applicant,
    existingComments,
    setExistingComments,
    isDirty,
  };
}
