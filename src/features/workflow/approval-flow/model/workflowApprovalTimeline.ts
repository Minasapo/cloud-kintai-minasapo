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

const createStaffLookups = (staffs: StaffType[]) => {
  const nameLookup = new Map<string, string>();
  const staffById = new Map<string, StaffType>();
  staffs.forEach((staff) => {
    if (staff.id) {
      staffById.set(staff.id, staff);
    }
    const name = mapStaffName(staff);
    if (!name) return;
    if (staff.id) nameLookup.set(staff.id, name);
    if (staff.cognitoUserId) nameLookup.set(staff.cognitoUserId, name);
  });
  const resolveStaffName = (identifier: StaffLookupKey): string | undefined => {
    if (!identifier) return undefined;
    return nameLookup.get(identifier) ?? identifier;
  };
  return { resolveStaffName, staffById };
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
  const { resolveStaffName, staffById } = createStaffLookups(staffs);
  if (!workflow?.staffId) {
    return { mode: "any", items: [DEFAULT_APPROVER_LABEL] };
  }

  const applicant = staffById.get(workflow.staffId) ?? null;
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
  const { resolveStaffName } = createStaffLookups(staffs);
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
  const fallbackState = isApproved ? "承認済み" : "未承認";
  const fallbackDate = isApproved ? applicationDate : "";

  const buildFallbackStep = (
    name: string,
    id: string,
    role: string
  ): WorkflowApprovalStepView => ({
    id,
    name,
    role,
    state: fallbackState,
    date: fallbackDate,
    comment: "",
  });

  if (approverInfo.mode === "any") {
    const hasSpecificItems =
      approverInfo.items.length > 0 &&
      approverInfo.items.some((item) => item !== DEFAULT_APPROVER_LABEL);
    const fallbackName = hasSpecificItems
      ? approverInfo.items.filter(Boolean).join(" / ")
      : DEFAULT_APPROVER_LABEL;
    const fallbackRole = hasSpecificItems ? "承認者（複数）" : "承認者";
    const fallback = buildFallbackStep(fallbackName, "s1", fallbackRole);
    return [...base, fallback];
  }

  if (approverInfo.mode === "single") {
    const fallback = buildFallbackStep(
      approverInfo.items[0] ?? "未設定",
      "s1",
      "承認者"
    );
    return [...base, fallback];
  }

  if (approverInfo.mode === "order") {
    const fallbackSteps = approverInfo.items.map(
      (name, idx): WorkflowApprovalStepView =>
        buildFallbackStep(name || "未設定", `s${idx + 1}`, "承認者")
    );
    return [...base, ...fallbackSteps];
  }

  return base;
};
