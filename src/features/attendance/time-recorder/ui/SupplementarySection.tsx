import QuickDailyReportCard from "./QuickDailyReportCard";
import { RestTimeMessage } from "./RestTimeMessage";

type SupplementarySectionProps = {
  hasSupplementaryInfo: boolean;
  staffId: string | null;
  today: string;
};

export default function SupplementarySection({
  hasSupplementaryInfo,
  staffId,
  today,
}: SupplementarySectionProps) {
  if (!hasSupplementaryInfo) {
    return null;
  }

  return (
    <div className="supplementary-section">
      <QuickDailyReportCard staffId={staffId} date={today} />
      <RestTimeMessage displayMode="compact" />
    </div>
  );
}
