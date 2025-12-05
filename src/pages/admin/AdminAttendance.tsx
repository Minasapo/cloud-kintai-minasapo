import { Box, Container, Stack } from "@mui/material";
import CommonBreadcrumbs from "@shared/ui/breadcrumbs/CommonBreadcrumbs";

import AttendanceDailyList from "../../components/AttendanceDailyList/AttendanceDailyList";
import DownloadForm from "../../components/download_form/DownloadForm";

export default function AdminAttendance() {
  return (
    <Container maxWidth="xl">
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Box>
          <CommonBreadcrumbs
            items={[{ label: "TOP", href: "/" }]}
            current="勤怠管理"
          />
        </Box>
        <Stack spacing={1}>
          <Box>
            <DownloadForm />
          </Box>
          <Box sx={{ flexGrow: 2, py: 2 }}>
            <AttendanceDailyList />
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}
