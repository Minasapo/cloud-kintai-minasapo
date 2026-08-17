import {
  AttendanceControl,
  AttendanceGetValues,
  AttendanceSetValue,
} from "@features/attendance/edit/model/types";
import {
  getRemarksValue,
  updateRemarks,
} from "@features/attendance/edit/ui/items/remarksItemUtils";
import { AppTextField } from "@shared/ui/form";
import { Controller } from "react-hook-form";

const INPUT_PLACEHOLDER = "備考を入力してください（タグは上に表示されます）";

type RemarksInputFieldProps = {
  control: AttendanceControl | undefined;
  getValues: AttendanceGetValues;
  setValue: AttendanceSetValue | undefined;
  readOnly: boolean;
};

export function RemarksInputField({
  control,
  getValues,
  setValue,
  readOnly,
}: RemarksInputFieldProps) {
  const commonProps = {
    fullWidth: true,
    multiline: true,
    minRows: 3,
    placeholder: INPUT_PLACEHOLDER,
    disabled: readOnly,
    inputProps: { "data-testid": "remarks-input" },
  };

  if (control) {
    return (
      <Controller
        name="remarks"
        control={control}
        render={({ field }) => (
          <AppTextField {...commonProps} {...field} value={field.value ?? ""} />
        )}
      />
    );
  }

  return (
    <AppTextField
      {...commonProps}
      value={getRemarksValue(getValues)}
      onChange={(e) => updateRemarks(setValue, readOnly, e.target.value)}
    />
  );
}
