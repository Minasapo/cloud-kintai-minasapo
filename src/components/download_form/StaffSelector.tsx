import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Stack,
  TextField,
} from "@mui/material";
import { Control, Controller, UseFormSetValue } from "react-hook-form";

import {
  MARGINS,
  SELECTOR_MAX_WIDTH,
  SELECTOR_MIN_WIDTH,
} from "@/constants/uiDimensions";

import { StaffType } from "../../hooks/useStaffs/useStaffs";
import { Inputs } from "./DownloadForm";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type Props = {
  control: Control<Inputs> | undefined;
  staffs: StaffType[];
  selectedStaff: StaffType[];
  setSelectedStaff: (s: StaffType[]) => void;
  setValue: UseFormSetValue<Inputs>;
};

export default function StaffSelector({
  control,
  staffs,
  selectedStaff,
  setSelectedStaff,
  setValue,
}: Props) {
  return (
    <Stack spacing={1}>
      <Box>
        <Controller
          name="staffs"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              value={selectedStaff}
              multiple
              limitTags={2}
              id="multiple-limit-tags"
              options={staffs}
              disableCloseOnSelect
              getOptionLabel={(option) =>
                `${option?.familyName || ""} ${option?.givenName || ""}`
              }
              defaultValue={[]}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: MARGINS.CHECKBOX_MARGIN }}
                    checked={selected}
                  />
                  {`${option?.familyName || ""} ${option?.givenName || ""}`}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="対象者リスト"
                  placeholder="対象者を入力..."
                  size="small"
                />
              )}
              sx={{
                width: "100%",
                minWidth: SELECTOR_MIN_WIDTH,
                maxWidth: SELECTOR_MAX_WIDTH,
              }}
              onChange={(_, value) => {
                setSelectedStaff(value);
                setValue("staffs", value);
              }}
            />
          )}
        />
      </Box>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setSelectedStaff(staffs);
            setValue("staffs", staffs);
          }}
          disabled={
            staffs.length === 0 || selectedStaff.length === staffs.length
          }
        >
          全選択
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setSelectedStaff([]);
            setValue("staffs", []);
          }}
          disabled={selectedStaff.length === 0}
        >
          全解除
        </Button>
      </Stack>
    </Stack>
  );
}
