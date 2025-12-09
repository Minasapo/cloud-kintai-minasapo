import { Autocomplete, TextField, TextFieldProps } from "@mui/material";
import { Control, Controller } from "react-hook-form";

import { DocumentFormInputs, documentTargetRoleOptions } from "./types";

export type DocumentTargetRoleSelectProps = {
  control: Control<DocumentFormInputs>;
  textFieldProps?: TextFieldProps;
  options?: readonly string[];
};

export function DocumentTargetRoleSelect({
  control,
  textFieldProps,
  options,
}: DocumentTargetRoleSelectProps) {
  const mergedTextFieldProps: TextFieldProps = {
    label: textFieldProps?.label ?? "対象者",
    size: textFieldProps?.size ?? "medium",
    ...textFieldProps,
  };

  return (
    <Controller
      name="targetRole"
      control={control}
      render={({ field }) => (
        <Autocomplete
          multiple
          value={field.value}
          options={(options ?? documentTargetRoleOptions) as string[]}
          onChange={(_, data) => field.onChange(data)}
          renderInput={(params) => (
            <TextField {...params} {...mergedTextFieldProps} />
          )}
        />
      )}
    />
  );
}
