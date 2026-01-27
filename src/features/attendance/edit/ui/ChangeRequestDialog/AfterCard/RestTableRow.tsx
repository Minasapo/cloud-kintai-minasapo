import { Box, Stack, TableCell, TableRow } from "@mui/material";
import { Rest } from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { AttendanceTime } from "@/entities/attendance/lib/AttendanceTime";

export default function RestTableRow({
  rests,
  beforeRests,
}: {
  // null means the change request did not include rests (no change)
  // empty array means the change request explicitly cleared rests
  rests: Rest[] | null;
  beforeRests?: Rest[];
}) {
  const before = beforeRests ?? [];

  // determine whether something changed
  const changed =
    rests === null
      ? false
      : before.length !== rests.length ||
        (rests.some((r, i) => {
          const b = before[i] ?? null;
          const rs = r.startTime ? dayjs(r.startTime).format("HH:mm") : null;
          const re = r.endTime ? dayjs(r.endTime).format("HH:mm") : null;
          const bs = b?.startTime ? dayjs(b.startTime).format("HH:mm") : null;
          const be = b?.endTime ? dayjs(b.endTime).format("HH:mm") : null;

          return rs !== bs || re !== be;
        }) as unknown as boolean);

  return (
    <TableRow>
      <TableCell>休憩時間</TableCell>
      <TableCell
        sx={changed ? { color: "error.main", fontWeight: "bold" } : {}}
      >
        {(() => {
          // when rests is null, the change request didn't touch rests
          if (rests === null) {
            return "(変更なし)";
          }

          // explicit clear
          if (rests.length === 0) {
            return "空にしました";
          }

          return (
            <Stack spacing={1}>
              {rests.map((rest, index) => {
                const startTime = rest.startTime ? dayjs(rest.startTime) : null;
                const endTime = rest.endTime ? dayjs(rest.endTime) : null;

                return (
                  <Box key={index}>
                    {`${startTime?.format("HH:mm") ?? AttendanceTime.None} 〜 ${
                      endTime?.format("HH:mm") ?? AttendanceTime.None
                    }`}
                  </Box>
                );
              })}
            </Stack>
          );
        })()}
      </TableCell>
    </TableRow>
  );
}
