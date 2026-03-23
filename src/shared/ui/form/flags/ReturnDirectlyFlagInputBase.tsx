import type { ComponentType } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

type Layout = "row" | "inline";
type InputVariant = "checkbox" | "switch";

type BooleanInputProps = {
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  inputRef?: (instance: HTMLInputElement | null) => void;
  onBlur?: () => void;
  onChange?: () => void;
};

type BooleanInputComponent = ComponentType<BooleanInputProps>;

function NativeCheckbox({
  checked = false,
  disabled = false,
  name,
  inputRef,
  onBlur,
  onChange,
}: BooleanInputProps) {
  return (
    <input
      ref={inputRef}
      type="checkbox"
      name={name}
      checked={checked}
      disabled={disabled}
      onBlur={onBlur}
      onChange={onChange}
      className="h-4 w-4 accent-emerald-600"
    />
  );
}

function NativeSwitch({
  checked = false,
  disabled = false,
  name,
  inputRef,
  onBlur,
  onChange,
}: BooleanInputProps) {
  return (
    <label className="relative inline-flex h-8 w-14 shrink-0 items-center">
      <input
        ref={inputRef}
        type="checkbox"
        name={name}
        checked={checked}
        disabled={disabled}
        onBlur={onBlur}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors duration-200 peer-checked:bg-emerald-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />
      <span className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-6" />
    </label>
  );
}

export interface ReturnDirectlyFlagInputBaseProps<
  TFieldValues extends FieldValues
> {
  control: Control<TFieldValues> | undefined;
  disabled?: boolean;
  onChangeFlag?: (checked: boolean) => void;
  label?: string;
  checkedValueName?: Path<TFieldValues>;
  inputComponent?: BooleanInputComponent;
  layout?: Layout;
  inputVariant?: InputVariant;
}

export default function ReturnDirectlyFlagInputBase<
  TFieldValues extends FieldValues
>({
  control,
  disabled = false,
  onChangeFlag,
  label = "直帰",
  checkedValueName = "returnDirectlyFlag" as Path<TFieldValues>,
  inputComponent,
  layout = "row",
  inputVariant = "checkbox",
}: ReturnDirectlyFlagInputBaseProps<TFieldValues>) {
  if (!control) return null;

  const Input =
    inputComponent ?? (inputVariant === "switch" ? NativeSwitch : NativeCheckbox);

  const handleToggle = (
    value: boolean | undefined,
    onChange: (nextValue: boolean) => void
  ) => {
    const nextValue = !value;
    if (onChangeFlag) onChangeFlag(nextValue);
    onChange(nextValue);
  };

  if (layout === "row") {
    return (
      <div className="flex items-center">
        <div className="w-[150px] font-bold">{label}</div>
        <div>
          <Controller
            name={checkedValueName}
            control={control}
            disabled={disabled}
            render={({ field }) => (
              <Input
                {...field}
                checked={field.value || false}
                inputRef={field.ref}
                onChange={() => handleToggle(field.value, field.onChange)}
              />
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-1 flex items-center gap-2">
      <p className="m-0 pb-2 font-bold">{label}</p>
      <Controller
        name={checkedValueName}
        control={control}
        disabled={disabled}
        render={({ field }) => (
          <Input
            {...field}
            checked={field.value || false}
            inputRef={field.ref}
            onChange={() => handleToggle(field.value, field.onChange)}
          />
        )}
      />
    </div>
  );
}
