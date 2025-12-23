import { AttendanceTableSection } from "@features/admin/staffAttendanceList/components/AttendanceTableSection";
import {
  pendingAttendanceContainerSx,
  PendingAttendanceSection,
} from "@features/admin/staffAttendanceList/components/PendingAttendanceSection";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Attendance } from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAdminStaffAttendanceListViewModel } from "@/features/admin/staffAttendanceList/useAdminStaffAttendanceListViewModel";
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
    quickViewAttendance,
    quickViewChangeRequest,
    quickViewOpen,
    handleOpenQuickView,
    handleCloseQuickView,
    selectedAttendanceIds,
    isAttendanceSelected,
    toggleAttendanceSelection,
    toggleSelectAllPending,
    bulkApproving,
    canBulkApprove,
    handleBulkApprove,
    getTableRowVariant,
    getBadgeContent,
  } = useAdminStaffAttendanceListViewModel(staffId);

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

  const handleDateNavigate = useCallback(
    (date: Dayjs | null) => {
      if (!date || !staffId) return;
      navigate(
        `/admin/attendances/edit/${date.format(
          AttendanceDate.QueryParamFormat
        )}/${staffId}`
      );
    },
    [navigate, staffId]
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
      <PageSection variant="surface">{content}</PageSection>
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
        <PageSection variant="surface" sx={{ gap: SECTION_CONTENT_GAP }}>
          <DatePicker
            value={dayjs()}
            format={AttendanceDate.DisplayFormat}
            label="日付を指定して移動"
            slotProps={{
              textField: { size: "small" },
            }}
            onChange={handleDateNavigate}
          />
        </PageSection>

        <PageSection variant="surface" sx={{ gap: SECTION_CONTENT_GAP }}>
          <AttendanceGraph attendances={attendances} />
        </PageSection>

        {pendingAttendances.length > 0 && (
          <PageSection variant="surface" sx={{ gap: SECTION_CONTENT_GAP }}>
            <Box sx={pendingAttendanceContainerSx}>
              <PendingAttendanceSection
                attendances={pendingAttendances}
                staff={staff}
                holidayCalendars={holidayCalendars}
                companyHolidayCalendars={companyHolidayCalendars}
                selectedAttendanceIds={selectedAttendanceIds}
                isAttendanceSelected={isAttendanceSelected}
                toggleAttendanceSelection={toggleAttendanceSelection}
                toggleSelectAll={toggleSelectAllPending}
                bulkApproving={bulkApproving}
                canBulkApprove={canBulkApprove}
                onBulkApprove={handleBulkApprove}
                onOpenQuickView={handleOpenQuickView}
                onEdit={handleEdit}
                getBadgeContent={getBadgeContent}
                getRowVariant={getTableRowVariant}
              />
            </Box>
          </PageSection>
        )}

        <PageSection variant="surface">
          <AttendanceTableSection
            attendances={attendances}
            staff={staff}
            holidayCalendars={holidayCalendars}
            companyHolidayCalendars={companyHolidayCalendars}
            onEdit={handleEdit}
            getBadgeContent={getBadgeContent}
            onOpenQuickView={handleOpenQuickView}
            getRowVariant={getTableRowVariant}
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
