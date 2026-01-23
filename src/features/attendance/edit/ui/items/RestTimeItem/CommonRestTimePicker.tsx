import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext } from "react";
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayUpdate,
} from "react-hook-form";

import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/pages/attendance/edit/common";

import { AttendanceControl, AttendanceFieldPath } from "../../../model/types";

interface CommonRestTimePickerProps {
  name: AttendanceFieldPath;
  value: string | null | undefined;
  workDate: dayjs.Dayjs;
  control: AttendanceControl;
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  index: number;
  restUpdate: UseFieldArrayUpdate<AttendanceEditInputs, "rests">;
  chipLabel: string;
  onChipClick: () => void;
}

export function CommonRestTimePicker({
  name,
  value,
  workDate,
  control,
  rest,
  index,
  restUpdate,
  chipLabel,
  onChipClick,
}: CommonRestTimePickerProps) {
  const { readOnly } = useContext(AttendanceEditContext);

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TimePicker
            value={value ? dayjs(value) : null}
            ampm={false}
            slotProps={{
              textField: { size: "small" },
            }}
            disabled={!!readOnly}
            onChange={(newValue) => {
              if (newValue && !newValue.isValid()) {
                return;
              }

              const formatted = (() => {
                if (!newValue) return null;

                return newValue
                  .year(workDate.year())
                  .month(workDate.month())
                  .date(workDate.date())
                  .second(0)
                  .millisecond(0)
                  .toISOString();
              })();

              field.onChange(formatted);

              restUpdate(index, {
                ...rest,
                [name.split(".").pop()!]: formatted,
              });
            }}
          />
        )}
      />
      <Box>
        <Chip
          label={chipLabel}
          variant="outlined"
          color="success"
          icon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
          onClick={() => {
            if (readOnly) return;
            onChipClick();
          }}
        />
      </Box>
    </>
  );
}
