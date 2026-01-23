import {
  Checkbox,
  Stack,
  styled,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ChangeEvent, ComponentType, ReactNode } from "react";
import { Controller } from "react-hook-form";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";
import { Label as MobileLabel } from "@/features/attendance/edit/ui/mobile/Label";

import {
  AttendanceBooleanFieldName,
  AttendanceControl,
  AttendanceControllerField,
} from "../model/types";

const DesktopLabel = styled(Typography)(() => ({
  width: "150px",
  fontWeight: "bold",
}));

type BooleanFieldName = AttendanceBooleanFieldName;
type BooleanField = AttendanceControllerField<BooleanFieldName>;

interface GoDirectlyFlagCheckboxProps {
  control: AttendanceControl;
  name: BooleanFieldName;
  label?: ReactNode;
  disabled?: boolean;
  onChangeExtra?: (checked: boolean) => void;
  inputComponent?: BooleanInputComponent;
  mobileLabel?: ReactNode;
}

type BooleanInputProps = {
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  inputRef?: BooleanField["ref"];
  onBlur?: BooleanField["onBlur"];
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked?: boolean) => void;
};

type BooleanInputComponent = ComponentType<BooleanInputProps>;

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
      onChange={(event, checkedFromComponent) => {
        const checked = checkedFromComponent ?? event.target.checked;
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
  mobileLabel,
}: GoDirectlyFlagCheckboxProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const ComponentToRender = inputComponent ?? (isMobile ? Switch : Checkbox);
  const InputComponent = ComponentToRender as BooleanInputComponent;
  const displayLabel = isMobile && mobileLabel ? mobileLabel : label;

  if (isMobile) {
    return (
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <MobileLabel variant="body1">{displayLabel}</MobileLabel>
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
      </Stack>
    );
  }

  // デスクトップ
  return (
    <Stack direction="row" alignItems="center">
      <DesktopLabel variant="body1">{label}</DesktopLabel>
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
    </Stack>
  );
}
