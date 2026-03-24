import AdminDailyReportDetail from "./AdminDailyReportDetail";

interface DailyReportDetailPanelProps {
  panelId: string;
}

export default function DailyReportDetailPanel({
  panelId,
}: DailyReportDetailPanelProps) {
  const reportId = panelId.replace(/^daily-report-/, "");
  return <AdminDailyReportDetail overrideId={reportId} />;
}
