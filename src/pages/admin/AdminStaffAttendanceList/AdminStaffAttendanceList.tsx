import {
  pendingAttendanceContainerSx,
  PendingAttendanceSection,
} from "@features/admin/staffAttendanceList/components/PendingAttendanceSection";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAdminStaffAttendanceListViewModel } from "@/features/admin/staffAttendanceList/useAdminStaffAttendanceListViewModel";
import DesktopCalendarView from "@/features/attendance/list/DesktopCalendarView";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { designTokenVar } from "@/shared/designSystem";
import { PageSection } from "@/shared/ui/layout";

import { AttendanceGraph } from "./AttendanceGraph";
import ChangeRequestQuickViewDialog from "./ChangeRequestQuickViewDialog";

const PAGE_PADDING_X = {
  xs: designTokenVar("spacing.lg", "16px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_PADDING_Y = {
  xs: designTokenVar("spacing.xl", "24px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_SECTION_GAP = designTokenVar("spacing.xl", "24px");
const SECTION_CONTENT_GAP = designTokenVar("spacing.md", "12px");

export default function AdminStaffAttendanceList() {
  const { staffId } = useParams();
  const navigate = useNavigate();

  const {
    staff,
    holidayCalendars,
    companyHolidayCalendars,
    calendarLoading,
    attendances,
    attendanceLoading,
    pendingAttendances,
    changeRequestControls,
    pendingAttendanceControls,
    getTableRowVariant,
    getBadgeContent,
  } = useAdminStaffAttendanceListViewModel(staffId);

  const {
    quickViewAttendance,
    quickViewChangeRequest,
    quickViewOpen,
    handleCloseQuickView,
  } = changeRequestControls;

  const handleEdit = useCallback(
    (attendance: Attendance) => {
      if (!staffId) return;
      const workDate = dayjs(attendance.workDate).format(
        AttendanceDate.QueryParamFormat
      );
      navigate(`/admin/attendances/edit/${workDate}/${staffId}`);
    },
    [navigate, staffId]
  );

  const buildCalendarNavigatePath = useCallback(
    (formattedWorkDate: string) => {
      if (!staffId) {
        return "/admin/attendances";
      }
      return `/admin/attendances/edit/${formattedWorkDate}/${staffId}`;
    },
    [staffId]
  );

  const renderStandaloneSection = (content: ReactNode) => (
    <Stack
      component="section"
      sx={{
        flex: 1,
        width: "100%",
        boxSizing: "border-box",
        px: PAGE_PADDING_X,
        py: PAGE_PADDING_Y,
      }}
    >
      <PageSection variant="surface" layoutVariant="dashboard">
        {content}
      </PageSection>
    </Stack>
  );

  if (staff === null || !staffId) {
    return renderStandaloneSection(
      <Typography>データ取得中に何らかの問題が発生しました</Typography>
    );
  }

  if (attendanceLoading || calendarLoading) {
    return renderStandaloneSection(<LinearProgress />);
  }

  return (
    <>
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
          sx={{ gap: SECTION_CONTENT_GAP }}
        >
          <AttendanceGraph attendances={attendances} />
        </PageSection>

        {pendingAttendances.length > 0 && (
          <PageSection
            variant="surface"
            layoutVariant="dashboard"
            sx={{ gap: SECTION_CONTENT_GAP }}
          >
            <Box sx={pendingAttendanceContainerSx}>
              <PendingAttendanceSection
                attendances={pendingAttendances}
                staff={staff}
                holidayCalendars={holidayCalendars}
                companyHolidayCalendars={companyHolidayCalendars}
                changeRequestControls={pendingAttendanceControls}
                onEdit={handleEdit}
                getBadgeContent={getBadgeContent}
                getRowVariant={getTableRowVariant}
              />
            </Box>
          </PageSection>
        )}

        <PageSection variant="surface" layoutVariant="dashboard">
          <DesktopCalendarView
            attendances={attendances}
            staff={staff}
            holidayCalendars={holidayCalendars}
            companyHolidayCalendars={companyHolidayCalendars}
            navigate={navigate}
            buildNavigatePath={buildCalendarNavigatePath}
          />
        </PageSection>
      </Stack>
      <ChangeRequestQuickViewDialog
        open={quickViewOpen}
        attendance={quickViewAttendance}
        changeRequest={quickViewChangeRequest}
        onClose={handleCloseQuickView}
      />
    </>
  );
}
