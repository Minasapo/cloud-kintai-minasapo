import { AppButton } from "@shared/ui/button";
import { Download } from "lucide-react";

import { DailyReportFilterBar } from "./components/DailyReportFilterBar";
import { DailyReportTableSection } from "./components/DailyReportTableSection";
import { STATUS_BADGE_CLASS } from "./components/styles";
import DailyReportCarouselDialog from "./DailyReportCarouselDialog";
import { useAdminDailyReportList } from "./hooks/useAdminDailyReportList";

// Re-export CSV helpers for backward-compatible test imports.
export {
  buildDailyReportCsv,
  formatDailyReportFileName,
} from "./services/dailyReportCsv";

export default function AdminDailyReport() {
  const {
    isStaffLoading,
    staffError,
    statusFilter,
    setStatusFilter,
    staffFilter,
    setStaffFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    isLoadingReports,
    loadError,
    selectedReport,
    isDialogOpen,
    staffOptions,
    filteredReports,
    paginatedReports,
    statusSummary,
    visibleReports,
    totalPages,
    rangeStart,
    rangeEnd,
    handleCloseDialog,
    handleNavigateDetail,
    handleOpenInRightPanel,
    handleOpenCarousel,
    handleExportCsv,
  } = useAdminDailyReportList();

  return (
    <div className="w-full px-2 pb-6 pt-4 sm:px-4 md:px-6">
      <div className="space-y-3">
        <section className="rounded-[18px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-5 py-4">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {statusSummary.map((status) => (
                <span key={status.key} className={STATUS_BADGE_CLASS[status.color]}>
                  {status.label} {status.count}
                </span>
              ))}
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-xs font-medium text-emerald-700">
                合計 {visibleReports.length}
              </span>
            </div>
          </div>
        </section>

        {(loadError || staffError) && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError || staffError?.message || "データの取得に失敗しました。"}
          </div>
        )}

        <DailyReportFilterBar
          statusFilter={statusFilter}
          staffFilter={staffFilter}
          startDate={startDate}
          endDate={endDate}
          staffOptions={staffOptions}
          onStatusChange={(v) => { setStatusFilter(v); setPage(0); }}
          onStaffChange={(v) => { setStaffFilter(v); setPage(0); }}
          onStartDateChange={(v) => { setStartDate(v); setPage(0); }}
          onEndDateChange={(v) => { setEndDate(v); setPage(0); }}
        />

        <div className="flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
          <AppButton
            onClick={handleExportCsv}
            disabled={filteredReports.length === 0}
            size="sm"
            variant="solid"
            tone="primary"
            className="app-save-button"
            startIcon={<Download size={16} strokeWidth={2} />}
          >
            CSV出力
          </AppButton>

          <AppButton
            onClick={handleOpenCarousel}
            disabled={filteredReports.length === 0}
            data-testid="admin-daily-report-carousel-button"
            size="sm"
            variant="outline"
            tone="secondary"
            className="min-w-0"
          >
            まとめて確認
          </AppButton>
        </div>

        <DailyReportTableSection
          isLoadingReports={isLoadingReports}
          isStaffLoading={isStaffLoading}
          paginatedReports={paginatedReports}
          filteredReports={filteredReports}
          page={page}
          rowsPerPage={rowsPerPage}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onRowsPerPageChange={(v) => { setRowsPerPage(v); setPage(0); }}
          onPageChange={setPage}
          onNavigateDetail={handleNavigateDetail}
          onOpenInRightPanel={handleOpenInRightPanel}
        />
      </div>

      {selectedReport && (
        <DailyReportCarouselDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          selectedReport={selectedReport}
          filteredReports={filteredReports}
        />
      )}
    </div>
  );
}
