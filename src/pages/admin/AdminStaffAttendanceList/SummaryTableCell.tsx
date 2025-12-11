import { Box, Chip, Stack, TableCell, Tooltip } from "@mui/material";
import { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";

export function SummaryTableCell({
  substituteHolidayDate,
  remarks,
  specialHolidayFlag,
  paidHolidayFlag,
  absentFlag,
}: {
  substituteHolidayDate: Attendance["substituteHolidayDate"];
  remarks: Attendance["remarks"];
  specialHolidayFlag?: Attendance["specialHolidayFlag"];
  paidHolidayFlag?: Attendance["paidHolidayFlag"];
  absentFlag?: Attendance["absentFlag"];
}) {
  const full = getSummaryText(
    substituteHolidayDate,
    remarks,
    specialHolidayFlag,
    paidHolidayFlag,
    absentFlag
  );

  const MAX = 32; // 表示する最大文字数（必要に応じて変更）
  const needTruncate = full && full.length > MAX;
  const visible = needTruncate ? `${full.slice(0, MAX)}...` : full;

  return (
    <TableCell
      sx={{
        maxWidth: 300,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {/* チップ表示 + 備考 */}
      <Box component="span">
        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* チップ群 */}
          {specialHolidayFlag && (
            <Chip size="small" label="特別休暇" color="info" />
          )}
          {paidHolidayFlag && (
            <Chip size="small" label="有給休暇" color="success" />
          )}
          {absentFlag && <Chip size="small" label="欠勤" color="error" />}

          {/* 備考部分 */}
          {needTruncate ? (
            <Tooltip title={full} arrow placement="top">
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  cursor: "help",
                  ml: 0.5,
                }}
              >
                {visible}
              </Box>
            </Tooltip>
          ) : (
            <Box component="span" sx={{ ml: 0.5 }}>
              {visible}
            </Box>
          )}
        </Stack>
      </Box>
    </TableCell>
  );
}

function getSummaryText(
  substituteHolidayDate: Attendance["substituteHolidayDate"],
  remarks: string | null | undefined,
  _specialHolidayFlag?: Attendance["specialHolidayFlag"],
  _paidHolidayFlag?: Attendance["paidHolidayFlag"],
  _absentFlag?: Attendance["absentFlag"]
) {
  const isSubstituteHoliday = substituteHolidayDate
    ? dayjs(substituteHolidayDate).isValid()
    : false;

  return (() => {
    const summaryMessage = [];
    // paidHolidayFlag / absentFlag / specialHolidayFlag は
    // Chip 表示で視覚的に示すため、備考のテキストには含めない
    // paidHolidayFlag と absentFlag はここで扱われていないが、
    // SummaryTableCell に Chip 表示用に props を渡す際に参照できます。
    if (isSubstituteHoliday) summaryMessage.push("振替休日");
    if (remarks) summaryMessage.push(remarks);

    return summaryMessage.join(" ");
  })();
}
