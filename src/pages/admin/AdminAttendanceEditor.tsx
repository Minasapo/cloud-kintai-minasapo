import AttendanceEditor from "@features/attendance/edit/ui/AttendanceEditor";
import { PageContent } from "@shared/ui/layout";
import { useSearchParams } from "react-router-dom";

export default function AdminAttendanceEditor() {
  const [searchParams] = useSearchParams();
  const readOnly = searchParams.get("readOnly") === "true";

  return (
    <PageContent width="wide" className="pt-1">
      <AttendanceEditor readOnly={readOnly} />
    </PageContent>
  );
}
