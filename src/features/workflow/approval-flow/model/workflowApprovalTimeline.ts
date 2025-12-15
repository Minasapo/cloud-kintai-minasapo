import type { ApprovalStep, GetWorkflowQuery } from "@shared/api/graphql/types";
import { ApprovalStatus, WorkflowStatus } from "@shared/api/graphql/types";

import type { StaffType } from "@/hooks/useStaffs/useStaffs";

import type { WorkflowApprovalStepView } from "../types";

const DEFAULT_APPROVER_LABEL = "管理者全員";

export type WorkflowApproverInfo = {
  mode: "any" | "single" | "order";
  items: string[];
};

type BuildTimelineParams = {
  workflow: NonNullable<GetWorkflowQuery["getWorkflow"]> | null;
  staffs: StaffType[];
  applicantName: string;
  applicationDate: string;
};

type StaffLookupKey = string | null | undefined;

const mapStaffName = (staff?: StaffType | null): string | undefined => {
  if (!staff) return undefined;
  const family = staff.familyName ?? "";
  const given = staff.givenName ?? "";
  const name = `${family} ${given}`.trim();
  return name || undefined;
};

const findStaffNameByIdentifier = (
  identifier: StaffLookupKey,
  staffs: StaffType[]
): string | undefined => {
  if (!identifier) return undefined;
  const staff = staffs.find(
    (s) => s.id === identifier || s.cognitoUserId === identifier
  );
  return mapStaffName(staff) ?? identifier;
};

const mapApprovalStatus = (status?: ApprovalStatus | null): string => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return "承認済み";
    case ApprovalStatus.REJECTED:
      return "却下";
    case ApprovalStatus.SKIPPED:
      return "スキップ";
    case ApprovalStatus.PENDING:
      return "未承認";
    default:
      return "未承認";
  }
};

export const deriveWorkflowApproverInfo = (
  workflow: NonNullable<GetWorkflowQuery["getWorkflow"]> | null,
  staffs: StaffType[]
): WorkflowApproverInfo => {
  if (!workflow?.staffId) {
    return { mode: "any", items: [DEFAULT_APPROVER_LABEL] };
  }

  const applicant = staffs.find((s) => s.id === workflow.staffId) ?? null;
  const setting = applicant?.approverSetting ?? null;

  if (!setting || setting === "ADMINS") {
    return { mode: "any", items: [DEFAULT_APPROVER_LABEL] };
  }

  if (setting === "SINGLE") {
    const targetId = applicant?.approverSingle ?? null;
    if (!targetId) {
      return { mode: "single", items: ["未設定"] };
    }
    const name = findStaffNameByIdentifier(targetId, staffs);
    return { mode: "single", items: [name ?? targetId] };
  }

  if (setting === "MULTIPLE") {
    const multiple = (applicant?.approverMultiple ?? []).filter(
      (id): id is string => Boolean(id)
    );
    if (multiple.length === 0) {
      return { mode: "any", items: ["未設定"] };
    }
    const names = multiple.map((id) => findStaffNameByIdentifier(id, staffs));
    const resolved = names.map((name, idx) => name ?? multiple[idx]);
    const orderMode = applicant?.approverMultipleMode === "ORDER";
    return { mode: orderMode ? "order" : "any", items: resolved };
  }

  return { mode: "any", items: [DEFAULT_APPROVER_LABEL] };
};

export const buildWorkflowApprovalTimeline = ({
  workflow,
  staffs,
  applicantName,
  applicationDate,
}: BuildTimelineParams): WorkflowApprovalStepView[] => {
  const base: WorkflowApprovalStepView[] = [
    {
      id: "s0",
      name: applicantName,
      role: "申請者",
      state: "",
      date: applicationDate,
      comment: "",
    },
  ];

  if (!workflow) {
    return base;
  }

  const approvalSteps =
    (workflow.approvalSteps as (ApprovalStep | null)[]) ?? [];
  if (approvalSteps.length > 0) {
    const normalized = approvalSteps
      .filter((step): step is ApprovalStep => Boolean(step))
      .sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0))
      .map((step, idx) => {
        const approverId = step.approverStaffId ?? "";
        const name: string | undefined =
          approverId === "ADMINS"
            ? DEFAULT_APPROVER_LABEL
            : findStaffNameByIdentifier(approverId, staffs);
        const timestamp = step.decisionTimestamp
          ? new Date(step.decisionTimestamp).toLocaleString()
          : "";
        return {
          id: step.id ?? `s${idx + 1}`,
          name: name ?? (approverId || "未設定"),
          role: "承認者",
          state: mapApprovalStatus(step.decisionStatus),
          date: timestamp,
          comment: step.approverComment ?? "",
        } satisfies WorkflowApprovalStepView;
      });
    return [...base, ...normalized];
  }

  const approverInfo = deriveWorkflowApproverInfo(workflow, staffs);
  const isApproved = workflow.status === WorkflowStatus.APPROVED;

  const appendFallbackStep = (step: WorkflowApprovalStepView) => {
    base.push(step);
    if (!isApproved) {
      base[0] = { ...base[0], date: applicationDate };
    }
  };

  if (approverInfo.mode === "any") {
    const hasSpecificItems =
      approverInfo.items.length > 0 &&
      approverInfo.items.some((item) => item !== DEFAULT_APPROVER_LABEL);
    appendFallbackStep({
      id: "s1",
      name: hasSpecificItems
        ? approverInfo.items.filter(Boolean).join(" / ")
        : DEFAULT_APPROVER_LABEL,
      role: hasSpecificItems ? "承認者（複数）" : "承認者",
      state: isApproved ? "承認済み" : "未承認",
      date: isApproved ? applicationDate : "",
      comment: "",
    });
    return base;
  }

  if (approverInfo.mode === "single") {
    appendFallbackStep({
      id: "s1",
      name: approverInfo.items[0] ?? "未設定",
      role: "承認者",
      state: isApproved ? "承認済み" : "未承認",
      date: isApproved ? applicationDate : "",
      comment: "",
    });
    return base;
  }

  if (approverInfo.mode === "order") {
    approverInfo.items.forEach((name, idx) => {
      appendFallbackStep({
        id: `s${idx + 1}`,
        name: name || "未設定",
        role: "承認者",
        state: isApproved ? "承認済み" : "未承認",
        date: isApproved ? applicationDate : "",
        comment: "",
      });
    });
    return base;
  }

  return base;
};
