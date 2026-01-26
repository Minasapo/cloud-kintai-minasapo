import { Autocomplete, Box, TableCell, TextField } from "@mui/material";
import {
  Control,
  Controller,
  FieldValues,
  UseFormSetValue,
} from "react-hook-form";

import { ROLE_OPTIONS } from "@/features/admin/staff/ui/CreateStaffDialog";

type StaffRoleTableCellProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
};

export function StaffRoleTableCell<TFieldValues extends FieldValues>({
  control,
  setValue,
}: StaffRoleTableCellProps<TFieldValues>) {
  return (
    <TableCell>
      <Box>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              value={
                ROLE_OPTIONS.find(
                  (option) => String(option.value) === field.value
                ) ?? null
              }
              options={ROLE_OPTIONS}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{ width: 400 }} />
              )}
              onChange={(_, data) => {
                if (!data) return;
                setValue("role", data.value);
                field.onChange(data.value);
              }}
            />
          )}
        />
      </Box>
    </TableCell>
  );
}
