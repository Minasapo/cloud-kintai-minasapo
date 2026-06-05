import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { ReactNode } from "react";

type SelectValue = string | number;

export type AppSelectOption<TValue extends SelectValue> = {
  value: TValue | "";
  label: ReactNode;
};

type AppSelectProps<TValue extends SelectValue> = {
  label: string;
  labelId: string;
  value: TValue | "";
  options: ReadonlyArray<AppSelectOption<TValue>>;
  onChange: (value: TValue | "") => void;
  parseValue?: (rawValue: string) => TValue;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
};

export function AppSelect<TValue extends SelectValue>({
  label,
  labelId,
  value,
  options,
  onChange,
  parseValue,
  size = "small",
  sx,
}: AppSelectProps<TValue>) {
  return (
    <FormControl size={size} sx={sx}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        onChange={(event) => {
          const rawValue = event.target.value;
          if (rawValue === "") {
            onChange("");
            return;
          }

          const nextValue = parseValue
            ? parseValue(String(rawValue))
            : (rawValue as TValue);
          onChange(nextValue);
        }}
      >
        {options.map((option) => (
          <MenuItem key={String(option.value)} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
