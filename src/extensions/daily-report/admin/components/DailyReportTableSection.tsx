import { formatDateTimeReadable } from "@shared/lib/time";
import { AppIconButton } from "@shared/ui/button";

import { type AdminDailyReport, STATUS_META } from "../data";
import { STATUS_BADGE_CLASS } from "./styles";

type DailyReportTableSectionProps = {
  isLoadingReports: boolean;
  isStaffLoading: boolean;
  paginatedReports: AdminDailyReport[];
  filteredReports: AdminDailyReport[];
  page: number;
  rowsPerPage: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  onRowsPerPageChange: (value: number) => void;
  onPageChange: (updater: (p: number) => number) => void;
  onNavigateDetail: (report: AdminDailyReport) => void;
  onOpenInRightPanel: (report: AdminDailyReport) => void;
};

export function DailyReportTableSection({
  isLoadingReports,
  isStaffLoading,
  paginatedReports,
  filteredReports,
  page,
  rowsPerPage,
  totalPages,
  rangeStart,
  rangeEnd,
  onRowsPerPageChange,
  onPageChange,
  onNavigateDetail,
  onOpenInRightPanel,
}: DailyReportTableSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white/95">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-[44px] px-2 py-3" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">日付</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">スタッフ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">タイトル</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">ステータス</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">最終更新</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoadingReports || isStaffLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                  読み込み中...
                </td>
              </tr>
            ) : paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                  条件に一致する日報がありません。
                </td>
              </tr>
            ) : (
              paginatedReports.map((report) => (
                <tr key={report.id} className="group transition hover:bg-emerald-50/40">
                  <td className="px-2 py-2">
                    <AppIconButton
                      title="右側で開く"
                      aria-label="右側で開く"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInRightPanel(report);
                      }}
                      tone="neutral"
                      size="sm"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </AppIconButton>
                  </td>
                  <td className="cursor-pointer px-4 py-3 text-slate-700" onClick={() => onNavigateDetail(report)}>{report.date}</td>
                  <td className="cursor-pointer px-4 py-3 text-slate-700" onClick={() => onNavigateDetail(report)}>{report.author}</td>
                  <td className="cursor-pointer px-4 py-3 text-slate-700" onClick={() => onNavigateDetail(report)}>{report.title}</td>
                  <td className="px-4 py-3">
                    <span className={STATUS_BADGE_CLASS[STATUS_META[report.status].color]}>
                      {STATUS_META[report.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {report.updatedAt ? formatDateTimeReadable(report.updatedAt) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>表示件数:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            {filteredReports.length > 0
              ? `${rangeStart}–${rangeEnd} / ${filteredReports.length}件`
              : "0件"}
          </span>
          <div className="flex items-center gap-1">
            <AppIconButton
              onClick={() => onPageChange((p) => p - 1)}
              disabled={page <= 0}
              aria-label="前のページ"
              tone="neutral"
              size="sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </AppIconButton>
            <AppIconButton
              onClick={() => onPageChange((p) => p + 1)}
              disabled={page >= totalPages - 1}
              aria-label="次のページ"
              tone="neutral"
              size="sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </AppIconButton>
          </div>
        </div>
      </div>
    </section>
  );
}
