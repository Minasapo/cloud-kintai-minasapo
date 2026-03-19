import AttendanceEditor from "@features/attendance/edit/ui/AttendanceEditor";
import { useSearchParams } from "react-router-dom";

export default function AdminAttendanceEditor() {
  const [searchParams] = useSearchParams();
  const readOnly = searchParams.get("readOnly") === "true";

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pt-1 sm:px-6">
      <AttendanceEditor readOnly={readOnly} />
    </div>
  );
}
