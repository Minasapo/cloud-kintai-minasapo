import { ApprovalStatus, ApprovalStep, GetWorkflowQuery, WorkflowStatus } from "@shared/api/graphql/types";
import { useMemo } from "react";

import { formatDateSlash, isoDateFromTimestamp } from "@/shared/lib/time";

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

type StaffLike = {
  id: string;
  cognitoUserId?: string | null;
  familyName?: string | null;
  givenName?: string | null;
  approverSetting?: "ADMINS" | "SINGLE" | "MULTIPLE" | null;
  approverSingle?: string | null;
  approverMultiple?: Array<string | null> | null;
  approverMultipleMode?: "ORDER" | "ANY" | null;
};

export const useWorkflowDetailViewModel = ({
  workflow,
  staffs,
}: {
  workflow: WorkflowData | null;
  staffs: StaffLike[];
}) => {
  const staffName = useMemo(() => {
    if (!workflow?.staffId) return "—";
    const staff = staffs.find((item) => item.id === workflow.staffId);
    return staff ? `${staff.familyName} ${staff.givenName}` : workflow.staffId;
  }, [workflow, staffs]);

  const approverInfo = useMemo(() => {
    if (!workflow?.staffId) return { mode: "any", items: [] as string[] };
    const applicant = staffs.find((staff) => staff.id === workflow.staffId);
    const mode = applicant?.approverSetting ?? null;
    if (!mode || mode === "ADMINS") {
      return { mode: "any", items: ["管理者全員"] };
    }

    if (mode === "SINGLE") {
      const singleId = applicant?.approverSingle;
      if (!singleId) return { mode: "single", items: ["未設定"] };
      const staff = staffs.find(
        (item) => item.cognitoUserId === singleId || item.id === singleId
      );
      return {
        mode: "single",
        items: [staff ? `${staff.familyName} ${staff.givenName}` : singleId],
      };
    }

    if (mode === "MULTIPLE") {
      const multiple = applicant?.approverMultiple ?? [];
      if (multiple.length === 0) return { mode: "any", items: ["未設定"] };
      const items = multiple.map((approverId) => {
        const staff = staffs.find(
          (item) => item.cognitoUserId === approverId || item.id === approverId
        );
        return staff ? `${staff.familyName} ${staff.givenName}` : approverId || "";
      });
      const multipleMode = applicant?.approverMultipleMode ?? null;
      return { mode: multipleMode === "ORDER" ? "order" : "any", items };
    }

    return { mode: "any", items: ["管理者全員"] };
  }, [workflow, staffs]);

  const applicationDate = formatDateSlash(isoDateFromTimestamp(workflow?.createdAt));

  const approvalSteps = useMemo(() => {
    const base = [
      {
        id: "s0",
        name: staffName,
        role: "申請者",
        state: "",
        date: applicationDate,
        comment: "",
      },
    ];

    if (!workflow) return base;

    if (workflow.approvalSteps && workflow.approvalSteps.length > 0) {
      const steps = (workflow.approvalSteps as ApprovalStep[]).toSorted(
        (a, b) => (a?.stepOrder ?? 0) - (b?.stepOrder ?? 0)
      );
      steps.forEach((step, index) => {
        const approverId = step.approverStaffId || "";
        const staff = staffs.find((item) => item.id === approverId);
        const name =
          approverId === "ADMINS"
            ? "管理者全員"
            : staff
            ? `${staff.familyName} ${staff.givenName}`
            : approverId || "未設定";
        const state = step.decisionStatus
          ? step.decisionStatus === ApprovalStatus.APPROVED
            ? "承認済み"
            : step.decisionStatus === ApprovalStatus.REJECTED
            ? "却下"
            : step.decisionStatus === ApprovalStatus.SKIPPED
            ? "スキップ"
            : "未承認"
          : "未承認";
        const date = step.decisionTimestamp
          ? new Date(step.decisionTimestamp).toLocaleString()
          : "";

        base.push({
          id: step.id ?? `s${index + 1}`,
          name,
          role: "承認者",
          state,
          date,
          comment: step.approverComment ?? "",
        });
      });
      return base;
    }

    const isApproved = workflow.status === WorkflowStatus.APPROVED;
    if (approverInfo.mode === "any") {
      const hasSpecific =
        approverInfo.items.length > 0 && approverInfo.items[0] !== "管理者全員";
      base.push({
        id: "s1",
        name: hasSpecific ? approverInfo.items.join(" / ") : "管理者全員",
        role: hasSpecific ? "承認者（複数）" : "承認者",
        state: isApproved ? "承認済み" : "未承認",
        date: isApproved ? applicationDate : "",
        comment: "",
      });
      if (!isApproved) base[0].date = applicationDate;
      return base;
    }

    if (approverInfo.mode === "single") {
      base.push({
        id: "s1",
        name: approverInfo.items[0] ?? "未設定",
        role: "承認者",
        state: isApproved ? "承認済み" : "未承認",
        date: isApproved ? applicationDate : "",
        comment: "",
      });
      if (!isApproved) base[0].date = applicationDate;
      return base;
    }

    if (approverInfo.mode === "order") {
      approverInfo.items.forEach((item, index) => {
        base.push({
          id: `s${index + 1}`,
          name: item,
          role: "承認者",
          state: isApproved ? "承認済み" : "未承認",
          date: isApproved ? applicationDate : "",
          comment: "",
        });
      });
      if (!isApproved) base[0].date = applicationDate;
      return base;
    }

    return base;
  }, [workflow, staffs, staffName, applicationDate, approverInfo]);

  return {
    staffName,
    applicationDate,
    approvalSteps,
  };
};
