import { StaffFormValues } from "@features/admin/staff/model/staffForm";
import { AppTextField } from "@shared/ui/form";
import { UseFormRegister } from "react-hook-form";

const VALUE_CELL_CLASS = "border-b border-slate-200 px-4 py-3 align-middle";

type Props = {
  register: UseFormRegister<StaffFormValues>;
};

export function StaffNameTableCell({ register }: Props) {
  return (
    <td className={VALUE_CELL_CLASS} data-testid="staff-name-cell">
      <div className="space-y-2">
        <AppTextField
          {...register("familyName", { required: true })}
          inputProps={{ "data-testid": "familyName-input" }}
          size="small"
          sx={{ width: { xs: "100%", sm: 400 } }}
          placeholder="姓"
        />
        <AppTextField
          {...register("givenName", { required: true })}
          inputProps={{ "data-testid": "givenName-input" }}
          size="small"
          sx={{ width: { xs: "100%", sm: 400 } }}
          placeholder="名"
        />
      </div>
    </td>
  );
}
