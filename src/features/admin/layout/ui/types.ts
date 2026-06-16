import type { SxProps, Theme } from "@mui/material/styles";
import type { Dayjs } from "dayjs";
import type {
  CSSProperties,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export type SettingsButtonVariant = "primary" | "secondary" | "danger";
export type SettingsButtonSize = "sm" | "md";

export type SettingsButtonProps = {
  variant?: SettingsButtonVariant;
  size?: SettingsButtonSize;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  sx?: SxProps<Theme>;
};

export type SettingsRowProps = {
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export type FieldBaseProps = {
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
  required?: boolean;
};

export type SettingsTextFieldProps = FieldBaseProps & {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  name?: string;
  id?: string;
  autoComplete?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  maxLength?: number;
  style?: CSSProperties;
};

export type SettingsTextAreaFieldProps = FieldBaseProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  minRows?: number;
  textAreaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange" | "disabled"
  >;
};

export type SelectOption = {
  value: string;
  label: string;
  content?: ReactNode;
};

export type SettingsSelectProps = FieldBaseProps & {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  name?: string;
  id?: string;
};

export type SettingsCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

export type SettingsSwitchProps = SettingsCheckboxProps;

export type SettingsTimeFieldProps = FieldBaseProps & {
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  id?: string;
  name?: string;
};

export type SettingsAlertProps = {
  children: ReactNode;
  variant?: "info" | "warning" | "error";
  className?: string;
};