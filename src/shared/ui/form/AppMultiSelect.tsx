import {
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { ReactNode } from "react";

import { AppCheckbox } from "./AppCheckbox";

type SelectValue = string | number;

export type AppMultiSelectOption<TValue extends SelectValue> = {
  value: TValue;
  label: ReactNode;
};

type AppMultiSelectProps<TValue extends SelectValue> = {
  label: string;
  labelId: string;
  value: ReadonlyArray<TValue>;
  options: ReadonlyArray<AppMultiSelectOption<TValue>>;
  onChange: (values: TValue[]) => void;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
  menuMaxHeight?: number;
  onOpen?: () => void;
  onClose?: () => void;
  renderValue?: (values: ReadonlyArray<TValue>) => ReactNode;
  emptyText?: ReactNode;
};

export function AppMultiSelect<TValue extends SelectValue>({
  label,
  labelId,
  value,
  options,
  onChange,
  size = "small",
  sx,
  menuMaxHeight = 320,
  onOpen,
  onClose,
  renderValue,
  emptyText,
}: AppMultiSelectProps<TValue>) {
  const handleChange = (event: SelectChangeEvent<(TValue | string)[]>) => {
    const raw = event.target.value;
    const values = Array.isArray(raw)
      ? (raw as TValue[])
      : (String(raw)
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0) as TValue[]);
    onChange(values);
  };

  return (
    <FormControl size={size} sx={sx}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        multiple
        displayEmpty
        value={value as TValue[]}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        SelectDisplayProps={{ role: "button", "aria-haspopup": "listbox" }}
        onOpen={onOpen}
        onClose={onClose}
        renderValue={
          renderValue
            ? (selected) =>
                renderValue(selected as (string | number)[] as TValue[])
            : undefined
        }
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: menuMaxHeight,
            },
          },
        }}
      >
        {options.length === 0 && emptyText ? (
          <MenuItem disabled>{emptyText}</MenuItem>
        ) : null}
        {options.map((option) => {
          const checked = value.includes(option.value);
          return (
            <MenuItem key={String(option.value)} value={option.value}>
              <AppCheckbox checked={checked} size="small" />
              <ListItemText primary={option.label} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
