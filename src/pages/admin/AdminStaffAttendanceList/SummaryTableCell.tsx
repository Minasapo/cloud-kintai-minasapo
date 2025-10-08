import { Box, TableCell, Tooltip } from "@mui/material";
import dayjs from "dayjs";

import { Attendance } from "../../../API";

export function SummaryTableCell({
  paidHolidayFlag,
  substituteHolidayDate,
  remarks,
  specialHolidayFlag,
  absentFlag,
}: {
  paidHolidayFlag: Attendance["paidHolidayFlag"];
  substituteHolidayDate: Attendance["substituteHolidayDate"];
  remarks: Attendance["remarks"];
  specialHolidayFlag?: Attendance["specialHolidayFlag"];
  absentFlag?: Attendance["absentFlag"];
}) {
  const full = getSummaryText(
    paidHolidayFlag,
    substituteHolidayDate,
    remarks,
    specialHolidayFlag,
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
      {needTruncate ? (
        <Tooltip title={full} arrow placement="top">
          <Box
            component="span"
            sx={{
              display: "inline-block",
              verticalAlign: "middle",
              cursor: "help",
            }}
          >
            {visible}
          </Box>
        </Tooltip>
      ) : (
        <Box component="span">{visible}</Box>
      )}
    </TableCell>
  );
}

function getSummaryText(
  paidHolidayFlag: Attendance["paidHolidayFlag"],
  substituteHolidayDate: Attendance["substituteHolidayDate"],
  remarks: string | null | undefined,
  specialHolidayFlag?: Attendance["specialHolidayFlag"],
  absentFlag?: Attendance["absentFlag"]
) {
  const isSubstituteHoliday = substituteHolidayDate
    ? dayjs(substituteHolidayDate).isValid()
    : false;

  return (() => {
    const summaryMessage = [];
    if (absentFlag) summaryMessage.push("欠勤");
    // 管理画面では自動的に「有給休暇」と表示しないため、この行を削除
    if (specialHolidayFlag) summaryMessage.push("特別休暇");
    if (isSubstituteHoliday) summaryMessage.push("振替休日");
    if (remarks) summaryMessage.push(remarks);

    return summaryMessage.join(" ");
  })();
}
