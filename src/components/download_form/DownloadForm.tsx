import useCloseDates from "@entities/attendance/model/useCloseDates";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, CircularProgress, Stack } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// ...existing code
import {
  CARD_BORDER_WIDTH,
  LIST_WIDTHS,
  SELECTOR_MAX_WIDTH,
  STANDARD_PADDING,
} from "@/constants/uiDimensions";
import { AttendanceDate } from "@/lib/AttendanceDate";

import { StaffType, useStaffs } from "../../hooks/useStaffs/useStaffs";
import AggregateExportButton from "./AggregateExportButton";
import ExportButton from "./ExportButton";
import StaffSelector from "./StaffSelector";

export type Inputs = {
  startDate: dayjs.Dayjs | undefined;
  endDate: dayjs.Dayjs | undefined;
  staffs: StaffType[];
};

const defaultValues: Inputs = {
  startDate: undefined,
  endDate: undefined,
  staffs: [],
};

export default function DownloadForm() {
  const navigate = useNavigate();
  const [selectedStaff, setSelectedStaff] = useState<StaffType[]>([]);
  const { staffs, loading: staffLoading, error: staffError } = useStaffs();
  const {
    closeDates,
    loading: closeDateLoading,
    error: closeDateError,
  } = useCloseDates();

  const { control, setValue, watch } = useForm<Inputs>({
    mode: "onChange",
    defaultValues,
  });

  // special holiday inclusion is determined inside the export components via AppConfig

  // derive workDates from watched start/end date so we can pass to ExportButton
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const startDate = watch("startDate") ?? dayjs();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const endDate = watch("endDate") ?? dayjs();

  // Derived state: compute workDates from startDate and endDate
  const workDates = useMemo(() => {
    const dates: string[] = [];
    let date = startDate;
    while (date.isBefore(endDate) || date.isSame(endDate)) {
      dates.push(date.format(AttendanceDate.DataFormat));
      date = date.add(1, "day");
    }
    return dates;
  }, [startDate, endDate]);

  if (staffLoading || closeDateLoading) {
    return <CircularProgress />;
  }

  if (staffError || closeDateError) {
    return <div>エラーが発生しました</div>;
  }

  return (
    <Stack
      spacing={4}
      alignItems="center"
      sx={{
        border: CARD_BORDER_WIDTH,
        borderColor: "primary.main",
        borderRadius: "5px",
        pb: STANDARD_PADDING.CARD,
      }}
    >
      <Box
        sx={{
          p: STANDARD_PADDING.SMALL,
          width: LIST_WIDTHS.FULL,
          boxSizing: "border-box",
          textAlign: "center",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          borderRadius: "3px 3px 0 0",
        }}
      >
        ダウンロードオプション
      </Box>
      <Box>
        <Stack
          spacing={3}
          sx={{ display: "inline-block", boxSizing: "border-box" }}
        >
          <Box>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <DesktopDatePicker
                        {...field}
                        label="開始日"
                        format={AttendanceDate.DisplayFormat}
                        slotProps={{
                          textField: { variant: "outlined", size: "small" },
                        }}
                      />
                    )}
                  />
                </Box>
                <Box>〜</Box>
                <Box>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <DesktopDatePicker
                        {...field}
                        label="終了日"
                        format={AttendanceDate.DisplayFormat}
                        slotProps={{
                          textField: { variant: "outlined", size: "small" },
                        }}
                      />
                    )}
                  />
                </Box>
              </Stack>
              <Stack
                spacing={2}
                sx={{ maxWidth: SELECTOR_MAX_WIDTH, overflowX: "auto" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ whiteSpace: "nowrap" }}>集計対象月から:</Box>
                  <Chip
                    icon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
                    label="新規"
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      navigate("/admin/master/job_term");
                    }}
                  />
                  {closeDates
                    .sort((a, b) => dayjs(b.closeDate).diff(dayjs(a.closeDate)))
                    .map((closeDate, index) => (
                      <Chip
                        key={index}
                        label={dayjs(closeDate.closeDate).format("YYYY/MM")}
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          setValue("startDate", dayjs(closeDate.startDate));
                          setValue("endDate", dayjs(closeDate.endDate));
                        }}
                      />
                    ))}
                </Stack>
              </Stack>
            </Stack>
          </Box>
          <Box>
            <Stack spacing={1}>
              <Box sx={{ mt: 2 }}>
                <StaffSelector
                  control={control}
                  staffs={staffs}
                  selectedStaff={selectedStaff}
                  setSelectedStaff={setSelectedStaff}
                  setValue={setValue}
                />
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction="row" spacing={1}>
          <ExportButton workDates={workDates} selectedStaff={selectedStaff} />
          <AggregateExportButton
            workDates={workDates}
            selectedStaff={selectedStaff}
          />
        </Stack>
      </Box>
    </Stack>
  );
}
