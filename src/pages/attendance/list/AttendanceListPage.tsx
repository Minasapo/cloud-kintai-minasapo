import AttendanceList from "@features/attendance/list/AttendanceList";
import { Box, Container, Stack } from "@mui/material";

export default function AttendanceListPage() {
  return (
    <Container maxWidth="xl">
      <Stack direction="column" sx={{ height: 1, pt: 2, display: "flex" }}>
        <Box sx={{ height: 1 }}>
          <AttendanceList />
        </Box>
      </Stack>
    </Container>
  );
}
