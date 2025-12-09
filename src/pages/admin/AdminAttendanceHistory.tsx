import AttendanceEditor from "@features/attendance/edit/AttendanceEditor";
import { Container } from "@mui/material";

export default function AdminAttendanceHistory(): JSX.Element {
  // AttendanceEditor reads route params internally when needed, so this page
  // doesn't need to pull params itself.
  return (
    <Container maxWidth="xl" sx={{ pt: 1 }}>
      {/* render editor in readOnly mode */}
      <AttendanceEditor readOnly />
    </Container>
  );
}
