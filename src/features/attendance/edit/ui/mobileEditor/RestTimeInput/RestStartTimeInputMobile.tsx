import { FieldArrayWithId } from "react-hook-form";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

import SharedRestStartTimeInput from "../../desktopEditor/RestTimeItem/RestTimeInput/RestStartTimeInput";

export default function RestStartTimeInputMobile({
  rest,
  index,
  testIdPrefix = "mobile",
}: {
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  index: number;
  testIdPrefix?: string;
}) {
  return (
    <SharedRestStartTimeInput
      rest={rest}
      index={index}
      testIdPrefix={testIdPrefix}
    />
  );
}
