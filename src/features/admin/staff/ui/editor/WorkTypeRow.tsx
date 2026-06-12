import WORK_TYPE_OPTIONS from "@entities/staff/lib/workTypeOptions";
import { StaffFormValues } from "@features/admin/staff/model/staffForm";
import { Autocomplete } from "@mui/material";
import { AppTextField } from "@shared/ui/form";
import { Control, Controller, UseFormSetValue } from "react-hook-form";

const LABEL_CELL_CLASS =
  "w-[220px] min-w-[180px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900";
const VALUE_CELL_CLASS = "border-b border-slate-200 px-4 py-3 align-middle";

type Props = {
  control: Control<StaffFormValues>;
  setValue: UseFormSetValue<StaffFormValues>;
};

export function WorkTypeRow({ control, setValue }: Props) {
  return (
    <tr>
      <td className={LABEL_CELL_CLASS}>勤務形態</td>
      <td className={VALUE_CELL_CLASS}>
        <Controller
          name="workType"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              value={
                WORK_TYPE_OPTIONS.find(
                  (option) => option.value === field.value,
                ) ?? null
              }
              options={WORK_TYPE_OPTIONS}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => (
                <AppTextField
                  {...params}
                  size="small"
                  sx={{ width: { xs: "100%", sm: 400 } }}
                />
              )}
              onChange={(_, data) => {
                if (!data) return;
                setValue("workType", data.value);
                field.onChange(data.value);
              }}
            />
          )}
        />
      </td>
    </tr>
  );
}