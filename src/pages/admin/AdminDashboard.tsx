import { Stack } from "@mui/material";

import { useAdminDashboard } from "@/features/admin/dashboard/model/useAdminDashboard";
import { CurrentWorkingStaffCard } from "@/features/admin/dashboard/ui/CurrentWorkingStaffCard";
import { DailyReportStatusCard } from "@/features/admin/dashboard/ui/DailyReportStatusCard";
import { StaffWorkStatusChartCard } from "@/features/admin/dashboard/ui/StaffWorkStatusChartCard";
import { PAGE_PADDING_X, PAGE_PADDING_Y } from "@/features/admin/layout/adminLayoutTokens";
import { designTokenVar } from "@/shared/designSystem";
import { PageSection } from "@/shared/ui/layout";
import AdminPendingApprovalSummary from "@/widgets/layout/header/AdminPendingApprovalSummary";

const PAGE_SECTION_GAP = designTokenVar("spacing.lg", "16px");

export default function AdminDashboard() {
  const {
    isLoadingPeriodAttendances,
    isLoadingDailyReportStatus,
    staffLoading,
    closeDatesLoading,
    currentWorkingStaffCountLabel,
    submittedDailyReportCountLabel,
    approvedDailyReportCountLabel,
    currentWorkingStaffInfoLabel,
    aggregationPeriodInfoLabel,
    hasExcludedDuplicateAttendances,
    excludedDuplicateAttendanceCount,
    staffWorkStatusSummary,
    staffWorkStatusChartData,
    staffWorkStatusChartOptions,
  } = useAdminDashboard();

  return (
    <Stack
      component="section"
      sx={{
        flex: 1,
        width: "100%",
        boxSizing: "border-box",
        px: PAGE_PADDING_X,
        py: PAGE_PADDING_Y,
        gap: PAGE_SECTION_GAP,
      }}
    >
      <PageSection variant="plain" layoutVariant="dashboard">
        <div
          data-testid="admin-dashboard-count-cards-grid"
          className="grid grid-cols-1 gap-3 lg:grid-cols-4"
        >
          <CurrentWorkingStaffCard
            countLabel={currentWorkingStaffCountLabel}
            infoLabel={currentWorkingStaffInfoLabel}
          />

          <DailyReportStatusCard
            submittedCountLabel={submittedDailyReportCountLabel}
            approvedCountLabel={approvedDailyReportCountLabel}
            isLoading={isLoadingDailyReportStatus}
          />

          <AdminPendingApprovalSummary
            layoutMode="inline-cards"
            showAdminOnlyTag={false}
          />

          <StaffWorkStatusChartCard
            infoLabel={aggregationPeriodInfoLabel}
            isLoading={isLoadingPeriodAttendances || staffLoading || closeDatesLoading}
            hasData={staffWorkStatusSummary.length > 0}
            hasExcludedDuplicateAttendances={hasExcludedDuplicateAttendances}
            excludedDuplicateAttendanceCount={excludedDuplicateAttendanceCount}
            chartData={staffWorkStatusChartData}
            chartOptions={staffWorkStatusChartOptions}
          />
        </div>
      </PageSection>
    </Stack>
  );
}
