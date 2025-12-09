import { TextField, TextFieldProps } from "@mui/material";
import { UseFormRegister } from "react-hook-form";

import { DocumentFormInputs } from "./types";

export type DocumentTitleInputProps = {
  register: UseFormRegister<DocumentFormInputs>;
  textFieldProps?: TextFieldProps;
};

export function DocumentTitleInput({
  register,
  textFieldProps,
}: DocumentTitleInputProps) {
  const mergedTextFieldProps: TextFieldProps = {
    label: textFieldProps?.label ?? "タイトル",
    size: textFieldProps?.size,
    ...textFieldProps,
  };

  return <TextField {...mergedTextFieldProps} {...register("title")} />;
}
