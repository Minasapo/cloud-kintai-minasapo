import { Box, Checkbox, Stack } from "@mui/material";
import { ReactElement } from "react";
import { Control, Controller } from "react-hook-form";

import { Label as MobileLabel } from "../../pages/AttendanceEdit/MobileEditor/Label";

interface ReturnDirectlyFlagInputBaseProps {
  control: Control<any>;
  disabled?: boolean;
  onChangeFlag?: (checked: boolean) => void;
  label?: string;
  checkedValueName?: string;
  inputComponent?: (props: any) => ReactElement;
  layout?: "row" | "inline";
}

export default function ReturnDirectlyFlagInputBase({
  control,
  disabled = false,
  onChangeFlag,
  label = "直帰",
  checkedValueName = "returnDirectlyFlag",
  inputComponent,
  layout = "row",
}: ReturnDirectlyFlagInputBaseProps) {
  if (!control) return null;
  const Input = inputComponent || ((props) => <Checkbox {...props} />);

  if (layout === "row") {
    return (
      <Stack direction="row" alignItems={"center"}>
        <Box sx={{ fontWeight: "bold", width: "150px" }}>{label}</Box>
        <Box>
          <Controller
            name={checkedValueName}
            control={control}
            disabled={disabled}
            render={({ field }) => (
              <Input
                {...field}
                checked={field.value || false}
                onChange={() => {
                  if (onChangeFlag) onChangeFlag(!field.value);
                  field.onChange(!field.value);
                }}
              />
            )}
          />
        </Box>
      </Stack>
    );
  } else {
    return (
      <Stack direction="row" alignItems="center">
        <MobileLabel>{label}</MobileLabel>
        <Controller
          name={checkedValueName}
          control={control}
          disabled={disabled}
          render={({ field }) => (
            <Input
              {...field}
              checked={field.value || false}
              onChange={() => {
                if (onChangeFlag) onChangeFlag(!field.value);
                field.onChange(!field.value);
              }}
            />
          )}
        />
      </Stack>
    );
  }
}
