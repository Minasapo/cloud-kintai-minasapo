import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { ComponentType } from "react";

export type WorkDateItemProps = {
  workDate: dayjs.Dayjs | null;
  staffId?: string;
  MoveDateItemComponent: ComponentType<MoveDateComponentProps>;
};

type MoveDateComponentProps = {
  workDate: dayjs.Dayjs | null;
  staffId?: string;
};

export default function WorkDateItem({
  workDate,
  staffId,
  MoveDateItemComponent,
}: WorkDateItemProps) {
  if (!workDate) return null;

  return (
    <Stack direction="row" alignItems={"center"}>
      <Typography variant="body1" sx={{ fontWeight: "bold", width: "150px" }}>
        勤務日
      </Typography>
      <Box>
        {staffId ? (
          <MoveDateItemComponent workDate={workDate} staffId={staffId} />
        ) : (
          <MoveDateItemComponent workDate={workDate} />
        )}
      </Box>
    </Stack>
  );
}
