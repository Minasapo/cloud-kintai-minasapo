import { Container } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import AttendanceEditor from "../../components/attendance_editor/AttendanceEditor";

export default function AdminAttendanceEditor() {
  const [searchParams] = useSearchParams();
  const readOnly = searchParams.get("readOnly") === "true";

  return (
    <Container maxWidth="xl" sx={{ pt: 1 }}>
      <AttendanceEditor readOnly={readOnly} />
    </Container>
  );
}
