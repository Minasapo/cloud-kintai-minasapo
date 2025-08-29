import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, CircularProgress, Stack } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { AttendanceDate } from "@/lib/AttendanceDate";

import useCloseDates from "../../hooks/useCloseDates/useCloseDates";
import useStaffs, { StaffType } from "../../hooks/useStaffs/useStaffs";
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

  // derive workDates from watched start/end date so we can pass to ExportButton
  const startDate = watch("startDate") ?? dayjs();
  const endDate = watch("endDate") ?? dayjs();
  const workDates: string[] = [];
  let date = startDate;
  while (date.isBefore(endDate) || date.isSame(endDate)) {
    workDates.push(date.format(AttendanceDate.DataFormat));
    date = date.add(1, "day");
  }

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
        border: 1,
        borderColor: "primary.main",
        borderRadius: "5px",
        pb: 3,
      }}
    >
      <Box
        sx={{
          p: 1,
          width: 1,
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
              <Stack spacing={2} sx={{ maxWidth: 500, overflowX: "auto" }}>
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
