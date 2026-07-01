import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

type SelectOptionElement = ReactElement<{
  value?: string;
  children: ReactNode;
}>;

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
};

export default function SelectField({
  value,
  onChange,
  children,
}: SelectFieldProps) {
  const optionElements = Children.toArray(children).filter(
    isValidElement,
  ) as SelectOptionElement[];

  const options = optionElements.map((child) => ({
    value: String(child.props.value ?? ""),
    label: child.props.children,
  }));

  return (
    <Select
      fullWidth
      size="small"
      displayEmpty
      value={value}
      onChange={(event) => onChange(String(event.target.value))}
      renderValue={(selected) => {
        const matched = options.find((item) => item.value === String(selected));
        return matched?.label ?? "すべて";
      }}
      sx={{
        borderRadius: "10px",
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 1px 2px rgba(15, 23, 42, 0.04)",
        color: "rgb(15, 23, 42)",
        fontSize: "0.95rem",
        lineHeight: 1.5,
        transition:
          "border-color 150ms, box-shadow 150ms, background-color 150ms",
        "& .MuiSelect-select": {
          padding: "15.2px 48px 15.2px 16px",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgb(203, 213, 225)",
          borderRadius: "10px",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgb(148, 163, 184)",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgb(16, 185, 129)",
          boxShadow: "0 0 0 2px rgb(209 250 229)",
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
}
