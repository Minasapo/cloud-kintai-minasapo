import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import type {
  ControllerRenderProps,
  FieldValues,
  Path,
  UseControllerProps,
} from "react-hook-form";
import { Controller } from "react-hook-form";

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "size"
>;

type NativeTextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur"
>;

type RHFTextFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  label?: ReactNode;
  helperText?: ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  multiline?: boolean;
  minRows?: number;
  sx?: CSSProperties;
  inputProps?: NativeInputProps;
} & UseControllerProps<TFieldValues> &
  Omit<
    NativeInputProps & NativeTextAreaProps,
    "name" | "value" | "defaultValue" | "onChange" | "onBlur"
  >;

const inputBaseClassName =
  "w-full rounded-md border bg-white text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const inputSizeClassName = {
  small: "min-h-9 px-3 py-2 text-sm leading-5",
  medium: "min-h-10 px-3 py-2.5 text-base leading-6",
} as const;

const RHFTextField = <TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  label,
  helperText,
  error,
  fullWidth = false,
  size = "medium",
  multiline = false,
  minRows,
  sx,
  inputProps,
  className,
  style,
  required,
  disabled,
  type,
  ...rest
}: RHFTextFieldProps<TFieldValues>) => {
  const containerStyle = { ...sx, ...style };

  const renderInput = (
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>,
    errorMessage?: string,
  ) => {
    const hasError = Boolean(errorMessage) || Boolean(error);
    const inputClassName = [
      inputBaseClassName,
      inputSizeClassName[size],
      hasError
        ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
        : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <>
        {multiline ? (
          <textarea
            {...rest}
            name={field.name}
            value={
              (field.value as string | number | readonly string[] | undefined) ??
              ""
            }
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            rows={minRows}
            disabled={disabled}
            required={required}
            className={inputClassName}
          />
        ) : (
          <input
            {...rest}
            {...inputProps}
            name={field.name}
            value={
              (field.value as string | number | readonly string[] | undefined) ??
              ""
            }
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            disabled={disabled}
            required={required}
            type={type}
            className={inputClassName}
          />
        )}

        {(errorMessage ?? helperText) ? (
          <p
            className={`m-0 text-xs leading-5 ${hasError ? "text-rose-600" : "text-slate-500"}`}
          >
            {errorMessage ?? helperText}
          </p>
        ) : null}
      </>
    );
  };

  return (
    <div
      className={[fullWidth ? "w-full" : "", "space-y-1"].filter(Boolean).join(" ")}
      style={containerStyle}
    >
      {label ? (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required ? <span className="ml-1 text-rose-600">*</span> : null}
        </label>
      ) : null}
      <Controller
        name={name}
        control={control}
        rules={rules}
        shouldUnregister={shouldUnregister}
        defaultValue={defaultValue}
        render={({ field, fieldState }) =>
          renderInput(field, fieldState.error?.message)
        }
      />
    </div>
  );
};

export default RHFTextField;
