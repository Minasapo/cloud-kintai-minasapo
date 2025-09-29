import {
  Card,
  Table,
  TableBody,
  TableContainer,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";

import { AttendanceChangeRequest } from "../../../../API";
import SpecialHolidayFlagTableRow from "../BeforeCard/SpecialHolidayFlagTableRow";
import SubstituteHolidayDateTableRow from "../BeforeCard/SubstituteHolidayFlagDateRow";
import HourlyPaidHolidayTableRow from "../HourlyPaidHolidayTableRow";
import GoDirectlyFlagTableRow from "./GoDirectlyFlagTableRow";
import PaidHolidayFlagTableRow from "./PaidHolidayFlagTableRow";
import RemarksTableRow from "./RemarksTableRow";
import RestTableRow from "./RestTableRow";
import ReturnDirectlyFlagTableRow from "./ReturnDirectlyFlagTableRow";
import WorkTimeTableRow from "./WorkTimeTableRow";

export default function AfterCard({
  changeRequest,
  attendance,
}: {
  changeRequest: AttendanceChangeRequest | null;
  attendance: import("../../../../API").Attendance | null;
}) {
  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        変更後
      </Typography>
      <TableContainer>
        <Table>
          <TableBody>
            <PaidHolidayFlagTableRow
              value={changeRequest?.paidHolidayFlag}
              beforeValue={attendance?.paidHolidayFlag}
            />
            <SpecialHolidayFlagTableRow
              value={changeRequest?.specialHolidayFlag}
              beforeValue={attendance?.specialHolidayFlag}
            />
            <HourlyPaidHolidayTableRow
              hours={changeRequest?.hourlyPaidHolidayHours}
              times={changeRequest?.hourlyPaidHolidayTimes}
              variant="after"
              beforeHours={attendance?.hourlyPaidHolidayHours}
              beforeTimes={attendance?.hourlyPaidHolidayTimes}
            />
            <SubstituteHolidayDateTableRow
              value={changeRequest?.substituteHolidayDate}
              beforeValue={attendance?.substituteHolidayDate}
            />
            <GoDirectlyFlagTableRow
              value={changeRequest?.goDirectlyFlag}
              beforeValue={attendance?.goDirectlyFlag}
            />
            <ReturnDirectlyFlagTableRow
              value={changeRequest?.returnDirectlyFlag}
              beforeValue={attendance?.returnDirectlyFlag}
            />
            <WorkTimeTableRow
              startTime={
                changeRequest?.startTime ? dayjs(changeRequest.startTime) : null
              }
              endTime={
                changeRequest?.endTime ? dayjs(changeRequest.endTime) : null
              }
              beforeStartTime={
                attendance?.startTime ? dayjs(attendance.startTime) : null
              }
              beforeEndTime={
                attendance?.endTime ? dayjs(attendance.endTime) : null
              }
            />
            <RestTableRow
              rests={
                changeRequest?.rests
                  ? changeRequest.rests.filter(
                      (item): item is NonNullable<typeof item> => item !== null
                    )
                  : []
              }
              beforeRests={
                attendance?.rests
                  ? attendance.rests.filter(
                      (item): item is NonNullable<typeof item> => item !== null
                    )
                  : []
              }
            />
            <RemarksTableRow
              value={changeRequest?.remarks}
              beforeValue={attendance?.remarks}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
