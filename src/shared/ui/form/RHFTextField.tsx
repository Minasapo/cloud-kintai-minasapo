import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";
import type { FieldValues, Path, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";

type RHFTextFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  helperText?: TextFieldProps["helperText"];
} & UseControllerProps<TFieldValues> &
  Omit<
    TextFieldProps,
    "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "helperText"
  >;

const RHFTextField = <TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  helperText,
  ...textFieldProps
}: RHFTextFieldProps<TFieldValues>) => {
  const { field, fieldState } = useController({
    name,
    control,
    rules,
    shouldUnregister,
    defaultValue,
  });
  const { ref, ...fieldProps } = field;
  const errorMessage = fieldState.error?.message;

  return (
    <TextField
      {...textFieldProps}
      {...fieldProps}
      inputRef={ref}
      error={Boolean(errorMessage)}
      helperText={errorMessage ?? helperText}
    />
  );
};

export default RHFTextField;
