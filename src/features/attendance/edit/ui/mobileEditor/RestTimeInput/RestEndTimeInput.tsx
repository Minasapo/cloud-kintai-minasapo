import { AttendanceEditInputs } from "@features/attendance/edit/model/common";
import { FieldArrayWithId } from "react-hook-form";

import SharedRestEndTimeInput from "../../desktopEditor/RestTimeItem/RestTimeInput/RestEndTimeInput";

type RestEndTimeInputProps = {
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  index: number;
  testIdPrefix?: string;
};

export default function RestEndTimeInput({
  rest,
  index,
  testIdPrefix = "mobile",
}: RestEndTimeInputProps) {
  return (
    <SharedRestEndTimeInput
      rest={rest}
      index={index}
      testIdPrefix={testIdPrefix}
    />
  );
}
