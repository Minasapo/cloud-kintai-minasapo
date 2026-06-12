import { StaffFormValues } from "@features/admin/staff/model/staffForm";
import { AppTextField } from "@shared/ui/form";
import { UseFormRegister } from "react-hook-form";

const VALUE_CELL_CLASS = "border-b border-slate-200 px-4 py-3 align-middle";

type Props = {
  register: UseFormRegister<StaffFormValues>;
};

export function MailAddressTableCell({ register }: Props) {
  return (
    <td className={VALUE_CELL_CLASS}>
      <AppTextField
        {...register("mailAddress", { required: true })}
        size="small"
        sx={{ width: { xs: "100%", sm: 400 } }}
      />
    </td>
  );
}