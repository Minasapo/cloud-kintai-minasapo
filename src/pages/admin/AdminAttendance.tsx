import { Stack } from "@mui/material";

import AttendanceDailyList from "@/features/attendance/daily-list/ui/AttendanceDailyList";
import DownloadForm from "@/features/attendance/download-form/ui/DownloadForm";
import { designTokenVar } from "@/shared/designSystem";
import { PageSection } from "@/shared/ui/layout";

const PAGE_PADDING_X = {
  xs: designTokenVar("spacing.sm", "8px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_PADDING_Y = {
  xs: designTokenVar("spacing.xl", "24px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_SECTION_GAP = designTokenVar("spacing.lg", "16px");

export default function AdminAttendance() {
  return (
    <Stack
      component="section"
      sx={{
        flex: 1,
        width: "100%",
        boxSizing: "border-box",
        px: PAGE_PADDING_X,
        py: PAGE_PADDING_Y,
        gap: PAGE_SECTION_GAP,
      }}
    >
      <PageSection
        variant="surface"
        layoutVariant="dashboard"
        className="gap-0"
        sx={{
          position: "relative",
          zIndex: 20,
          overflow: "visible",
          borderRadius: "24px",
          border: "1px solid rgba(226,232,240,0.8)",
          backgroundColor: "#ffffff",
          boxShadow: "0 24px 48px -36px rgba(15,23,42,0.35)",
        }}
      >
        <DownloadForm />
      </PageSection>
      <PageSection
        variant="surface"
        layoutVariant="dashboard"
        className="gap-0"
        sx={{
          position: "relative",
          zIndex: 10,
          borderRadius: "24px",
          border: "1px solid rgba(226,232,240,0.8)",
          backgroundColor: "#ffffff",
          boxShadow: "0 24px 48px -36px rgba(15,23,42,0.35)",
        }}
      >
        <AttendanceDailyList />
      </PageSection>
    </Stack>
  );
}
