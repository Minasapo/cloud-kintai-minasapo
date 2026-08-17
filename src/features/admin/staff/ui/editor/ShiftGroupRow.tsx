import { isShiftWorkType } from "@entities/staff/lib/workTypeOptions";
import { StaffFormValues } from "@features/admin/staff/model/staffForm";
import { Autocomplete } from "@mui/material";
import { AppTextField } from "@shared/ui/form";
import { Control, Controller, useWatch } from "react-hook-form";

const LABEL_CELL_CLASS =
  "w-[220px] min-w-[180px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900";
const VALUE_CELL_CLASS = "border-b border-slate-200 px-4 py-3 align-middle";

type Props = {
  control: Control<StaffFormValues>;
  shiftGroupOptions: { value: string; label: string }[];
};

export function ShiftGroupRow({ control, shiftGroupOptions }: Props) {
  const workType = useWatch({
    control,
    name: "workType",
  });

  if (!isShiftWorkType(workType)) {
    return null;
  }

  return (
    <tr>
      <td className={LABEL_CELL_CLASS}>シフトグループ</td>
      <td className={VALUE_CELL_CLASS}>
        {shiftGroupOptions.length === 0 ? (
          <p className="text-sm text-slate-500">
            利用可能なシフトグループがありません。管理画面の「シフト設定」で登録してください。
          </p>
        ) : (
          <Controller
            name="shiftGroup"
            control={control}
            render={({ field }) => {
              const selectedOption =
                shiftGroupOptions.find(
                  (option) => option.value === field.value,
                ) ?? null;
              return (
                <Autocomplete
                  value={selectedOption}
                  options={shiftGroupOptions}
                  onChange={(_, newValue) => {
                    field.onChange(newValue?.value ?? null);
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                  renderInput={(params) => (
                    <AppTextField
                      {...params}
                      size="small"
                      sx={{ width: { xs: "100%", sm: 400 } }}
                      placeholder="所属させるシフトグループを選択"
                      onBlur={field.onBlur}
                    />
                  )}
                />
              );
            }}
          />
        )}
      </td>
    </tr>
  );
}
