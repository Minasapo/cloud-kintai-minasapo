import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip } from "@mui/material";
import { renderTimeViewClock, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";

interface CommonRestTimePickerProps {
  name: string;
  value: string | null | undefined;
  workDate: dayjs.Dayjs;
  control: any;
  rest: any;
  index: number;
  restUpdate: (index: number, rest: any) => void;
  chipLabel: string;
  onChipClick: () => void;
  onChange?: (newValue: dayjs.Dayjs | null, field: any) => void;
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
  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TimePicker
            value={value ? dayjs(value) : null}
            ampm={false}
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
            }}
            slotProps={{
              textField: { size: "small" },
            }}
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
          onClick={onChipClick}
        />
      </Box>
    </>
  );
}
