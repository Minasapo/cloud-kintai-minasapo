import { Stack, TableCell, TextField } from "@mui/material";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

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
          {...register("familyName" as Path<TFieldValues>, {
            required: true,
          })}
          size="small"
          label="姓"
        />
        <TextField
          {...register("givenName" as Path<TFieldValues>, {
            required: true,
          })}
          size="small"
          label="名"
        />
      </Stack>
    </TableCell>
  );
}
