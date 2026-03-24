import { ComponentType, ReactNode } from "react";
import { Controller } from "react-hook-form";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

import {
  AttendanceBooleanFieldName,
  AttendanceControl,
  AttendanceControllerField,
} from "../model/types";

type BooleanFieldName = AttendanceBooleanFieldName;
type BooleanField = AttendanceControllerField<BooleanFieldName>;
type Layout = "row" | "inline";
type InputVariant = "checkbox" | "switch";

interface GoDirectlyFlagCheckboxProps {
  control: AttendanceControl;
  name: BooleanFieldName;
  label?: ReactNode;
  disabled?: boolean;
  onChangeExtra?: (checked: boolean) => void;
  inputComponent?: BooleanInputComponent;
  layout?: Layout;
  inputVariant?: InputVariant;
}

type BooleanInputProps = {
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  inputRef?: BooleanField["ref"];
  onBlur?: BooleanField["onBlur"];
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

function RenderInput({
  field,
  disabled,
  InputComponent,
  onChangeExtra,
}: {
  field: BooleanField;
  disabled: boolean;
  InputComponent: BooleanInputComponent;
  onChangeExtra?: (checked: boolean) => void;
}) {
  return (
    <InputComponent
      checked={field.value ?? false}
      disabled={disabled}
      name={field.name}
      inputRef={field.ref}
      onBlur={field.onBlur}
      onChange={() => {
        const checked = !(field.value ?? false);
        field.onChange(checked);
        onChangeExtra?.(checked);
      }}
    />
  );
}

export function GoDirectlyFlagCheckbox({
  control,
  name,
  label = "直行",
  disabled = false,
  onChangeExtra,
  inputComponent,
  layout = "row",
  inputVariant = "checkbox",
}: GoDirectlyFlagCheckboxProps) {
  const ComponentToRender =
    inputComponent ??
    (inputVariant === "switch" ? NativeSwitch : NativeCheckbox);
  const InputComponent = ComponentToRender as BooleanInputComponent;

  if (layout === "inline") {
    return (
      <div className="mb-1 flex items-center gap-2">
        <p className="m-0 pb-2 font-bold">{label}</p>
        <Controller<AttendanceEditInputs, BooleanFieldName>
          name={name}
          control={control}
          render={({ field }) => (
            <RenderInput
              field={field}
              disabled={disabled}
              InputComponent={InputComponent}
              onChangeExtra={onChangeExtra}
            />
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="w-[150px] font-bold">{label}</div>
      <Controller<AttendanceEditInputs, BooleanFieldName>
        name={name}
        control={control}
        render={({ field }) => (
          <RenderInput
            field={field}
            disabled={disabled}
            InputComponent={InputComponent}
            onChangeExtra={onChangeExtra}
            />
          )}
        />
    </div>
  );
}
