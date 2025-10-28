import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { FieldArrayWithId } from "react-hook-form";

import { AttendanceEditContext } from "@/pages/AttendanceEdit/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/pages/AttendanceEdit/common";

import RestEndTimeInput from "./RestEndTimeInput";
import RestStartTimeInput from "./RestStartTimeInput";

export function calcTotalRestTime(
  startTime: string | null | undefined,
  endTime: string | null | undefined
) {
  if (!startTime) return 0;

  const now = dayjs();
  const diff = dayjs(endTime || now).diff(dayjs(startTime), "hour", true);
  return diff;
}

export function RestTimeItem({
  rest,
  index,
}: {
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  index: number;
}) {
  const { restRemove, readOnly } = useContext(AttendanceEditContext);
  const [totalRestTime, setTotalRestTime] = useState<number>(0);

  useEffect(() => {
    if (!rest.endTime) {
      setTotalRestTime(0);
      return;
    }

    const diff = calcTotalRestTime(rest.startTime, rest.endTime);
    setTotalRestTime(diff);
  }, [rest]);

  if (!restRemove) {
    return null;
  }

  return (
    <Box>
      <Stack direction="row" spacing={1}>
        <RestStartTimeInput index={index} rest={rest} />
        <Box>
          <Typography variant="body1" sx={{ my: 1 }}>
            ～
          </Typography>
        </Box>
        <RestEndTimeInput index={index} rest={rest} />
        <Box>
          <IconButton
            aria-label="staff-search"
            onClick={() => restRemove(index)}
            disabled={!!readOnly}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
        <Box sx={{ flexGrow: 1 }} textAlign={"right"}>
          {`${totalRestTime.toFixed(1)} 時間`}
        </Box>
      </Stack>
    </Box>
  );
}
