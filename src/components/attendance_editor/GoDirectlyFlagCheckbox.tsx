import {
  Checkbox,
  Stack,
  styled,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ElementType, ReactNode } from "react";
import { Control, Controller } from "react-hook-form";

import { AttendanceEditInputs } from "@/pages/AttendanceEdit/common";

import { Label as MobileLabel } from "../../pages/AttendanceEdit/MobileEditor/Label";

const DesktopLabel = styled(Typography)(() => ({
  width: "150px",
  fontWeight: "bold",
}));

interface GoDirectlyFlagCheckboxProps {
  control: Control<AttendanceEditInputs, any>;
  name: any;
  label?: ReactNode;
  disabled?: boolean;
  onChangeExtra?: (checked: boolean) => void;
  inputComponent?: ElementType<any>;
  mobileLabel?: ReactNode;
}

function RenderInput({
  field,
  disabled,
  InputComponent,
  onChangeExtra,
}: {
  field: any;
  disabled: boolean;
  InputComponent: ElementType<any>;
  onChangeExtra?: (checked: boolean) => void;
}) {
  return (
    <InputComponent
      checked={field.value || false}
      disabled={disabled}
      name={field.name}
      inputRef={field.ref}
      onBlur={field.onBlur}
      onChange={(e: any) => {
        const checked = e.target.checked;
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
  const InputComponent = inputComponent || (isMobile ? Switch : Checkbox);
  const displayLabel = isMobile && mobileLabel ? mobileLabel : label;

  if (isMobile) {
    return (
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <MobileLabel variant="body1">{displayLabel}</MobileLabel>
        <Controller
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
      <Controller
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
