import { TextField } from "@mui/material";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

type StaffNameTableCellProps<TFieldValues extends FieldValues> = {
  register: UseFormRegister<TFieldValues>;
};

const VALUE_CELL_CLASS = "border-b border-slate-200 px-4 py-3 align-middle";

export function StaffNameTableCell<TFieldValues extends FieldValues>({
  register,
}: StaffNameTableCellProps<TFieldValues>) {
  return (
    <td className={VALUE_CELL_CLASS}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <TextField
          {...register("familyName" as Path<TFieldValues>, {
            required: true,
          })}
          size="small"
          label="姓"
          sx={{ width: { xs: "100%", sm: 200 } }}
        />
        <TextField
          {...register("givenName" as Path<TFieldValues>, {
            required: true,
          })}
          size="small"
          label="名"
          sx={{ width: { xs: "100%", sm: 200 } }}
        />
      </div>
    </td>
  );
}
