import AttendanceEditor from "@features/attendance/edit/ui/AttendanceEditor";
import { Container } from "@mui/material";
import { useSearchParams } from "react-router-dom";

export default function AdminAttendanceEditor() {
  const [searchParams] = useSearchParams();
  const readOnly = searchParams.get("readOnly") === "true";

  return (
    <Container maxWidth="xl" sx={{ pt: 1 }}>
      <AttendanceEditor readOnly={readOnly} />
    </Container>
  );
}
