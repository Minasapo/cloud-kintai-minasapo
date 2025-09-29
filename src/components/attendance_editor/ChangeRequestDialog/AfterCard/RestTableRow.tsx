import { Box, Stack, TableCell, TableRow } from "@mui/material";
import dayjs from "dayjs";

import { AttendanceTime } from "@/lib/AttendanceTime";

import { Rest } from "../../../../API";

export default function RestTableRow({
  rests,
  beforeRests,
}: {
  rests: Rest[];
  beforeRests?: Rest[];
}) {
  const changed =
    (beforeRests ? beforeRests.length : 0) !== rests.length ||
    (rests.some((r, i) => {
      const b = beforeRests ? beforeRests[i] : null;
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
          if (rests.length === 0) {
            return "(変更なし)";
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
