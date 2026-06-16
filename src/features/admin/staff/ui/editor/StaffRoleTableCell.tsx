import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import { StaffFormValues } from "@features/admin/staff/model/staffForm";
import {
  Autocomplete,
} from "@mui/material";
import { AppTextField } from "@shared/ui/form";
import { Control, Controller, UseFormSetValue } from "react-hook-form";

const VALUE_CELL_CLASS = "border-b border-slate-200 px-4 py-3 align-middle";

type Props = {
  control: Control<StaffFormValues>;
  setValue: UseFormSetValue<StaffFormValues>;
};

export function StaffRoleTableCell({ control, setValue }: Props) {
  return (
    <td className={VALUE_CELL_CLASS}>
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <Autocomplete<{ value: StaffRole; label: string }>
            {...field}
            options={[
              { value: StaffRole.ADMIN, label: "管理者" },
              { value: StaffRole.STAFF, label: "スタッフ" },
              { value: StaffRole.OPERATOR, label: "オペレーター" },
            ]}
            getOptionLabel={(option) => option.label}
            value={
              [
                { value: StaffRole.ADMIN, label: "管理者" },
                { value: StaffRole.STAFF, label: "スタッフ" },
                { value: StaffRole.OPERATOR, label: "オペレーター" },
              ].find((opt) => opt.value === field.value) ?? null
            }
            renderInput={(params) => (
              <AppTextField
                {...params}
                label="役割"
                size="small"
              />
            )}
            onChange={(_, data) => {
              if (!data) return;
              setValue("role", data.value);
              field.onChange(data.value);
            }}
          />
        )}
      />
    </td>
  );
}