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
  startTime: UpdateAttendanceInput["startTime"] | null;
  endTime: UpdateAttendanceInput["endTime"] | null;
  isDeemedHoliday?: UpdateAttendanceInput["isDeemedHoliday"];
  specialHolidayFlag?: UpdateAttendanceInput["specialHolidayFlag"];
  paidHolidayFlag: UpdateAttendanceInput["paidHolidayFlag"];
  absentFlag?: UpdateAttendanceInput["absentFlag"];
  // hourlyPaidHolidayHours: UpdateAttendanceInput["hourlyPaidHolidayHours"];
  hourlyPaidHolidayTimes?: HourlyPaidHolidayTimeInputs[];
  substituteHolidayDate: UpdateAttendanceInput["substituteHolidayDate"];
  goDirectlyFlag: UpdateAttendanceInput["goDirectlyFlag"];
  returnDirectlyFlag: UpdateAttendanceInput["returnDirectlyFlag"];
  remarks: UpdateAttendanceInput["remarks"];
  remarkTags?: string[];
  rests: RestInputs[];
  staffComment?: string;
  histories?: UpdateAttendanceInput["histories"];
  changeRequests?: UpdateAttendanceInput["changeRequests"];
  systemComments: SystemCommentInput[];
  revision?: UpdateAttendanceInput["revision"];
};

export const defaultValues: AttendanceEditInputs = {
  startTime: "",
  isDeemedHoliday: false,
  specialHolidayFlag: false,
  endTime: "",
  paidHolidayFlag: false,
  // hourlyPaidHolidayHours: undefined,
  hourlyPaidHolidayTimes: [],
  substituteHolidayDate: undefined,
  absentFlag: false,
  goDirectlyFlag: false,
  returnDirectlyFlag: false,
  remarks: "",
  remarkTags: [],
  rests: [],
  systemComments: [],
};
