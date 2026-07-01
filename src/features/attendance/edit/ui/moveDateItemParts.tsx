import { DatePicker } from "@mui/x-date-pickers";
import { designTokenVar } from "@shared/designSystem";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";

type WorkDateInputProps = {
  defaultValue: string;
  ariaLabel: string;
  onChange: (value: string) => void;
};

export function WorkDateInput({
  defaultValue,
  ariaLabel,
  onChange,
}: WorkDateInputProps) {
  const initialValue = useMemo(() => {
    if (!defaultValue) {
      return null;
    }

    const parsed = dayjs(defaultValue);
    return parsed.isValid() ? parsed : null;
  }, [defaultValue]);
  const [value, setValue] = useState<Dayjs | null>(initialValue);

  return (
    <DatePicker
      value={value}
      format="YYYY/MM/DD"
      onChange={(nextValue) => {
        if (!nextValue || !nextValue.isValid()) {
          setValue(null);
          onChange("");
          return;
        }

        setValue(nextValue);
        onChange(nextValue.format("YYYY-MM-DD"));
      }}
      slotProps={{
        textField: {
          size: "small",
          inputProps: {
            "aria-label": ariaLabel,
          },
          sx: {
            width: "8rem",
            maxWidth: "100%",
            "& .MuiInputBase-root": {
              height: "34px",
              borderRadius: "16px",
              fontSize: "0.8125rem",
              backgroundColor: designTokenVar("component.pageSection.background"),
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.72)",
            },
            "& .MuiOutlinedInput-input": {
              padding: "6px 8px",
            },
            "& .MuiSvgIcon-root": {
              fontSize: "1rem",
            },
          },
        },
      }}
    />
  );
}
