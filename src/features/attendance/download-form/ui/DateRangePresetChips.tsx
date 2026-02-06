import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, Stack } from "@mui/material";
import dayjs from "dayjs";
import { UseFormSetValue } from "react-hook-form";
import { NavigateFunction } from "react-router-dom";

import { Inputs } from "./DownloadForm";

type CloseDate = {
  closeDate: string;
  startDate: string;
  endDate: string;
};

type Props = {
  closeDates: CloseDate[];
  setValue: UseFormSetValue<Inputs>;
  navigate: NavigateFunction;
};

// Inputs type imported from DownloadForm

export default function DateRangePresetChips({
  closeDates,
  setValue,
  navigate,
}: Props) {
  return (
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
        .toSorted((a, b) => dayjs(b.closeDate).diff(dayjs(a.closeDate)))
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
  );
}
