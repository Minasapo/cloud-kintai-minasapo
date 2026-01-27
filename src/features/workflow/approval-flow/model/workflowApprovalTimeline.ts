import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import type { ApprovalStep, GetWorkflowQuery } from "@shared/api/graphql/types";
import { ApprovalStatus, WorkflowStatus } from "@shared/api/graphql/types";

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

const createStaffNameResolver = (staffs: StaffType[]) => {
  const lookup = new Map<string, string>();
  staffs.forEach((staff) => {
    const name = mapStaffName(staff);
    if (!name) return;
    if (staff.id) lookup.set(staff.id, name);
    if (staff.cognitoUserId) lookup.set(staff.cognitoUserId, name);
  });
  return (identifier: StaffLookupKey): string | undefined => {
    if (!identifier) return undefined;
    return lookup.get(identifier) ?? identifier;
  };
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

const normalizeApprovalSteps = (
  steps: (ApprovalStep | null)[],
  resolveStaffName: (identifier: StaffLookupKey) => string | undefined
): WorkflowApprovalStepView[] =>
  steps
    .filter((step): step is ApprovalStep => Boolean(step))
    .sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0))
    .map((step, idx) => {
      const approverId = step.approverStaffId ?? "";
      const name: string | undefined =
        approverId === "ADMINS"
          ? DEFAULT_APPROVER_LABEL
          : resolveStaffName(approverId);
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

export const deriveWorkflowApproverInfo = (
  workflow: NonNullable<GetWorkflowQuery["getWorkflow"]> | null,
  staffs: StaffType[]
): WorkflowApproverInfo => {
  const resolveStaffName = createStaffNameResolver(staffs);
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
    const name = resolveStaffName(targetId);
    return { mode: "single", items: [name ?? targetId] };
  }

  if (setting === "MULTIPLE") {
    const multiple = (applicant?.approverMultiple ?? []).filter(
      (id): id is string => Boolean(id)
    );
    if (multiple.length === 0) {
      return { mode: "any", items: ["未設定"] };
    }
    const names = multiple.map((id) => resolveStaffName(id));
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
  const resolveStaffName = createStaffNameResolver(staffs);
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
    const normalized = normalizeApprovalSteps(
      approvalSteps,
      resolveStaffName
    );
    return [...base, ...normalized];
  }

  const approverInfo = deriveWorkflowApproverInfo(workflow, staffs);
  const isApproved = workflow.status === WorkflowStatus.APPROVED;

  if (approverInfo.mode === "any") {
    const hasSpecificItems =
      approverInfo.items.length > 0 &&
      approverInfo.items.some((item) => item !== DEFAULT_APPROVER_LABEL);
    const fallback: WorkflowApprovalStepView = {
      id: "s1",
      name: hasSpecificItems
        ? approverInfo.items.filter(Boolean).join(" / ")
        : DEFAULT_APPROVER_LABEL,
      role: hasSpecificItems ? "承認者（複数）" : "承認者",
      state: isApproved ? "承認済み" : "未承認",
      date: isApproved ? applicationDate : "",
      comment: "",
    };
    return [...base, fallback];
  }

  if (approverInfo.mode === "single") {
    const fallback: WorkflowApprovalStepView = {
      id: "s1",
      name: approverInfo.items[0] ?? "未設定",
      role: "承認者",
      state: isApproved ? "承認済み" : "未承認",
      date: isApproved ? applicationDate : "",
      comment: "",
    };
    return [...base, fallback];
  }

  if (approverInfo.mode === "order") {
    const fallbackSteps = approverInfo.items.map(
      (name, idx): WorkflowApprovalStepView => ({
        id: `s${idx + 1}`,
        name: name || "未設定",
        role: "承認者",
        state: isApproved ? "承認済み" : "未承認",
        date: isApproved ? applicationDate : "",
        comment: "",
      })
    );
    return [...base, ...fallbackSteps];
  }

  return base;
};
