import { Rest, SystemCommentInput, UpdateAttendanceInput } from "../../API";

export type RestInputs = {
  startTime: Rest["startTime"] | null;
  endTime: Rest["endTime"] | null;
};

export type HourlyPaidHolidayTimeInputs = {
  startTime: string | null;
  endTime: string | null;
};

export type AttendanceEditInputs = {
  workDate?: UpdateAttendanceInput["workDate"] | null;
  startTime: UpdateAttendanceInput["startTime"];
  endTime: UpdateAttendanceInput["endTime"];
  isDeemedHoliday?: UpdateAttendanceInput["isDeemedHoliday"];
  specialHolidayFlag?: UpdateAttendanceInput["specialHolidayFlag"];
  paidHolidayFlag: UpdateAttendanceInput["paidHolidayFlag"];
  // hourlyPaidHolidayHours: UpdateAttendanceInput["hourlyPaidHolidayHours"];
  hourlyPaidHolidayTimes?: HourlyPaidHolidayTimeInputs[];
  substituteHolidayDate: UpdateAttendanceInput["substituteHolidayDate"];
  goDirectlyFlag: UpdateAttendanceInput["goDirectlyFlag"];
  returnDirectlyFlag: UpdateAttendanceInput["returnDirectlyFlag"];
  remarks: UpdateAttendanceInput["remarks"];
  rests: RestInputs[];
  staffComment?: string;
  histories?: UpdateAttendanceInput["histories"];
  changeRequests?: UpdateAttendanceInput["changeRequests"];
  systemComments: SystemCommentInput[];
  revision?: UpdateAttendanceInput["revision"];
};

export const defaultValues: AttendanceEditInputs = {
  startTime: undefined,
  isDeemedHoliday: undefined,
  specialHolidayFlag: undefined,
  endTime: undefined,
  paidHolidayFlag: undefined,
  // hourlyPaidHolidayHours: undefined,
  hourlyPaidHolidayTimes: [],
  substituteHolidayDate: undefined,
  goDirectlyFlag: undefined,
  returnDirectlyFlag: undefined,
  remarks: undefined,
  rests: [],
  systemComments: [],
};
