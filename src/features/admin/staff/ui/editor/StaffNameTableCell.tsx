import { Stack, TableCell, TextField } from "@mui/material";
import { FieldValues, UseFormRegister } from "react-hook-form";

type StaffNameTableCellProps<TFieldValues extends FieldValues> = {
  register: UseFormRegister<TFieldValues>;
};

export function StaffNameTableCell<TFieldValues extends FieldValues>({
  register,
}: StaffNameTableCellProps<TFieldValues>) {
  return (
    <TableCell>
      <Stack direction="row" spacing={1}>
        <TextField
          {...register("familyName", { required: true })}
          size="small"
          label="姓"
        />
        <TextField
          {...register("givenName", { required: true })}
          size="small"
          label="名"
        />
      </Stack>
    </TableCell>
  );
}
