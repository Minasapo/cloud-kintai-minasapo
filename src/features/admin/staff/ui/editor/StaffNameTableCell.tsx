import { Stack, TableCell, TextField } from "@mui/material";
import { UseFormRegister } from "react-hook-form";

type StaffNameInputs = {
  familyName?: string | null;
  givenName?: string | null;
};

type StaffNameTableCellProps = {
  register: UseFormRegister<StaffNameInputs>;
};

export function StaffNameTableCell({ register }: StaffNameTableCellProps) {
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
