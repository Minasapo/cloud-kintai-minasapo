import AttendanceEditor from "@features/attendance/edit/ui/AttendanceEditor";

import { PageContent } from "@/shared/ui/layout";

export default function AdminAttendanceHistory(): JSX.Element {
  // AttendanceEditor reads route params internally when needed, so this page
  // doesn't need to pull params itself.
  return (
    <PageContent width="dashboard" className="pt-1">
      <AttendanceEditor readOnly />
    </PageContent>
  );
}
