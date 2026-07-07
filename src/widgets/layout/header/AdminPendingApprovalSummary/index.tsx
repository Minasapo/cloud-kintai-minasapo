import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import { useAuthSessionSummary } from "@shared/lib/useAuthSessionSummary";
import { useMemo } from "react";

import AdminSummaryCard from "../AdminSummaryCard";
import { usePendingAttendanceCount } from "./usePendingAttendanceCount";
import { usePendingWorkflowCount } from "./usePendingWorkflowCount";

type AdminPendingApprovalSummaryProps = {
  layoutMode?: "default" | "inline-cards" | "two-columns";
  showAdminOnlyTag?: boolean;
  visualVariant?: "default" | "dashboard";
};

export default function AdminPendingApprovalSummary({
  layoutMode = "default",
  showAdminOnlyTag = true,
  visualVariant = "default",
}: AdminPendingApprovalSummaryProps) {
  const { isAuthenticated, isCognitoUserRole } = useAuthSessionSummary();

  const isAdminUser = useMemo(
    () =>
      isCognitoUserRole(StaffRole.ADMIN) ||
      isCognitoUserRole(StaffRole.STAFF_ADMIN) ||
      isCognitoUserRole(StaffRole.OWNER),
    [isCognitoUserRole],
  );

  const { workflows, loading: workflowLoading = false } = useWorkflows({
    isAuthenticated: isAuthenticated && isAdminUser,
  });

  const { pendingAttendanceCount, attendanceLoading } =
    usePendingAttendanceCount(isAuthenticated, isAdminUser);

  const { pendingWorkflowCount } = usePendingWorkflowCount(workflows);

  if (!isAuthenticated || !isAdminUser) {
    return null;
  }

  const attendanceCountLabel = attendanceLoading
    ? "集計中"
    : `${pendingAttendanceCount}件`;
  const workflowCountLabel = workflowLoading
    ? "集計中"
    : `${pendingWorkflowCount}件`;
  const compact = layoutMode === "inline-cards";
  const containerClassName =
    layoutMode === "inline-cards"
      ? "contents"
      : layoutMode === "two-columns"
        ? "grid grid-cols-2 gap-3"
        : "grid grid-cols-1 gap-3";
  const cardClassName = layoutMode === "inline-cards" ? "" : "";

  return (
    <div
      data-testid="admin-pending-approval-summary"
      className={containerClassName}
    >
      <AdminSummaryCard
        testId="admin-pending-attendance-card"
        title="勤怠修正申請"
        description="未承認の勤怠修正申請"
        countLabel={attendanceCountLabel}
        to="/admin/attendances"
        className={cardClassName}
        showAdminOnlyTag={showAdminOnlyTag}
        compact={compact}
        visualVariant={visualVariant}
      />
      <AdminSummaryCard
        testId="admin-pending-workflow-card"
        title="ワークフロー申請"
        description="未承認のワークフロー申請"
        countLabel={workflowCountLabel}
        to="/admin/workflow"
        className={cardClassName}
        showAdminOnlyTag={showAdminOnlyTag}
        compact={compact}
        visualVariant={visualVariant}
      />
    </div>
  );
}
