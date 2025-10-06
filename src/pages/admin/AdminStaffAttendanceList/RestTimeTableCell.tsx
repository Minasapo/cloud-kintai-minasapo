import { TableCell } from "@mui/material";
import dayjs from "dayjs";
import { useContext } from "react";

import { Attendance } from "@/API";
import { AppConfigContext } from "@/context/AppConfigContext";

export function RestTimeTableCell({ attendance }: { attendance: Attendance }) {
  const { getLunchRestStartTime, getLunchRestEndTime } =
    useContext(AppConfigContext);
  const { paidHolidayFlag, rests } = attendance;

  const lunchRestStartTime = getLunchRestStartTime().format("H:mm");
  const lunchRestEndTime = getLunchRestEndTime().format("H:mm");

  const formattedRestStartTime = (() => {
    if (paidHolidayFlag) return lunchRestStartTime;
    if (!rests) return "";

    const filteredRests = rests.filter(
      (item): item is NonNullable<typeof item> => item !== null
    );
    if (filteredRests.length === 0) return "";

    const latestRest = filteredRests[filteredRests.length - 1];

    if (!latestRest.startTime) return "";

    const date = dayjs(latestRest.startTime);
    return date.format("H:mm");
  })();

  const formattedRestEndTime = (() => {
    if (paidHolidayFlag) return lunchRestEndTime;
    if (!rests) return "";

    const filteredRests = rests.filter(
      (item): item is NonNullable<typeof item> => item !== null
    );

    if (filteredRests.length === 0) return "";

    const latestRest = filteredRests[filteredRests.length - 1];

    if (!latestRest.endTime) return "";

    const date = dayjs(latestRest.endTime);
    return date.format("H:mm");
  })();

  if (!formattedRestStartTime && !formattedRestEndTime) {
    return <TableCell />;
  }

  return (
    <TableCell sx={{ whiteSpace: "nowrap" }}>
      {formattedRestStartTime} 〜 {formattedRestEndTime}
    </TableCell>
  );
}
