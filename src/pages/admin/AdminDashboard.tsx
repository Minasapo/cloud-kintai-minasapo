import { memo } from "react";

import { useAdminCurrentWorkingStaffCard } from "@/features/admin/dashboard/model/useAdminCurrentWorkingStaffCard";
import { useAdminDailyReportStatusCard } from "@/features/admin/dashboard/model/useAdminDailyReportStatusCard";
import { useAdminStaffWorkStatusChart } from "@/features/admin/dashboard/model/useAdminStaffWorkStatusChart";
import { CurrentWorkingStaffCard } from "@/features/admin/dashboard/ui/CurrentWorkingStaffCard";
import { DailyReportStatusCard } from "@/features/admin/dashboard/ui/DailyReportStatusCard";
import { StaffWorkStatusChartCard } from "@/features/admin/dashboard/ui/StaffWorkStatusChartCard";
import { designTokenVar } from "@/shared/designSystem";
import { PageSection } from "@/shared/ui/layout";
import AdminPendingApprovalSummary from "@/widgets/layout/header/AdminPendingApprovalSummary";

const PAGE_SECTION_GAP = designTokenVar("spacing.lg", "16px");

const CurrentWorkingStaffCardContainer = memo(function CurrentWorkingStaffCardContainer() {
  const { countLabel, infoLabel } = useAdminCurrentWorkingStaffCard();

  return <CurrentWorkingStaffCard countLabel={countLabel} infoLabel={infoLabel} />;
});

const DailyReportStatusCardContainer = memo(function DailyReportStatusCardContainer() {
  const { submittedCountLabel, approvedCountLabel, isLoading } =
    useAdminDailyReportStatusCard();

  return (
    <DailyReportStatusCard
      submittedCountLabel={submittedCountLabel}
      approvedCountLabel={approvedCountLabel}
      isLoading={isLoading}
    />
  );
});

const StaffWorkStatusChartCardContainer = memo(function StaffWorkStatusChartCardContainer() {
  const viewModel = useAdminStaffWorkStatusChart();

  return <StaffWorkStatusChartCard {...viewModel} />;
});

export default function AdminDashboard() {
  return (
    <section
      className="flex w-full flex-1 flex-col px-4 py-6 md:px-8 md:py-8"
      style={{
        boxSizing: "border-box",
        gap: PAGE_SECTION_GAP,
      }}
    >
      <PageSection variant="plain" layoutVariant="dashboard">
        <div
          data-testid="admin-dashboard-count-cards-grid"
          className="grid grid-cols-1 gap-3 lg:grid-cols-4"
        >
          <CurrentWorkingStaffCardContainer />

          <DailyReportStatusCardContainer />

          <AdminPendingApprovalSummary
            layoutMode="inline-cards"
            showAdminOnlyTag={false}
            visualVariant="dashboard"
          />

          <StaffWorkStatusChartCardContainer />
        </div>
      </PageSection>
    </section>
  );
}
