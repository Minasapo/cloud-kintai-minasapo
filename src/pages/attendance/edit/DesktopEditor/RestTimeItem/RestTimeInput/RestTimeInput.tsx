import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useContext, useMemo } from "react";
import { FieldArrayWithId, useWatch } from "react-hook-form";

import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";
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

export function RestTimeInput({
  rest,
  index,
}: {
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  index: number;
}) {
  const { restRemove, changeRequests, control } = useContext(
    AttendanceEditContext
  );
  
  // Watch the form data to compute total rest time
  const rests = useWatch({
    control,
    name: "rests",
  });

  // Derive total rest time from watched form data
  const totalRestTime = useMemo(() => {
    if (!rests || !rests[index]) return 0;
    const rest = rests[index];
    return calcTotalRestTime(rest.startTime, rest.endTime);
  }, [rests, index]);

  if (!restRemove) return null;

  return (
    <Box>
      <Stack direction="row" spacing={1}>
        <RestStartTimeInput rest={rest} index={index} testIdPrefix="desktop" />
        <Box>
          <Typography variant="body1" sx={{ my: 1 }}>
            ～
          </Typography>
        </Box>
        <RestEndTimeInput rest={rest} index={index} testIdPrefix="desktop" />
        <Box>
          <IconButton
            aria-label="staff-search"
            disabled={changeRequests.length > 0}
            onClick={() => restRemove(index)}
            data-testid={`rest-delete-button-${index}`}
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
