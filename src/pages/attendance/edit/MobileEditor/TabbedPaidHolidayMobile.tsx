import { VacationTabs } from "@features/attendance/edit/components/VacationTabs";
import HourlyPaidHolidayTimeItemMobile from "@features/attendance/edit/items/HourlyPaidHolidayTimeItemMobile";
import PaidHolidayFlagInputMobile from "@features/attendance/edit/PaidHolidayFlagInputMobile";
import {
  AttendanceControl,
  AttendanceGetValues,
  AttendanceSetValue,
} from "@features/attendance/edit/types";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Button, Checkbox, FormControlLabel, Stack } from "@mui/material";
import dayjs from "dayjs";
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayReplace,
} from "react-hook-form";

import { AttendanceEditInputs } from "../common";
import { Label } from "./Label";
import { SubstituteHolidayDateInput } from "./SubstituteHolidayDateInput";

interface TabbedPaidHolidayMobileProps {
  control: AttendanceControl;
  setValue: AttendanceSetValue;
  workDate: dayjs.Dayjs | null | undefined;
  restReplace: UseFieldArrayReplace<AttendanceEditInputs, "rests"> | undefined;
  getValues: AttendanceGetValues | undefined;
  getSpecialHolidayEnabled: (() => boolean) | undefined;
  changeRequestsLength: number;
  hourlyPaidHolidayEnabled: boolean;
  hourlyPaidHolidayTimeFields: FieldArrayWithId<
    AttendanceEditInputs,
    "hourlyPaidHolidayTimes",
    "id"
  >[];
  hourlyPaidHolidayTimeAppend:
    | UseFieldArrayAppend<AttendanceEditInputs, "hourlyPaidHolidayTimes">
    | undefined;
  holidayTab: number;
  setHolidayTab: (index: number) => void;
}

export function TabbedPaidHolidayMobile({
  control,
  setValue,
  workDate,
  restReplace,
  getValues,
  getSpecialHolidayEnabled,
  changeRequestsLength,
  hourlyPaidHolidayEnabled,
  hourlyPaidHolidayTimeFields,
  hourlyPaidHolidayTimeAppend,
  holidayTab,
  setHolidayTab,
}: TabbedPaidHolidayMobileProps) {
  const items: { label: string; content: JSX.Element }[] = [];
  items.push({
    label: "有給休暇",
    content: (
      <PaidHolidayFlagInputMobile
        control={control}
        setValue={setValue}
        workDate={workDate ? workDate.format("YYYY-MM-DD") : undefined}
        setPaidHolidayTimes={true}
        restReplace={restReplace}
        getValues={getValues}
      />
    ),
  });

  if (getSpecialHolidayEnabled && getSpecialHolidayEnabled()) {
    items.push({
      label: "特別休暇",
      content: (
        <>
          <Label>特別休暇</Label>
          <Stack direction="column" alignItems={"flex-start"} spacing={1}>
            <Box sx={{ color: "text.secondary", fontSize: 14 }}>
              有給休暇ではない特別な休暇(忌引きなど)です。利用時は管理者へご相談ください。
            </Box>
            <Controller
              name="specialHolidayFlag"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={changeRequestsLength > 0}
                    />
                  }
                  label=""
                />
              )}
            />
          </Stack>
        </>
      ),
    });
  }

  items.push({
    label: "時間休暇",
    content: !hourlyPaidHolidayEnabled ? (
      <Stack sx={{ color: "text.secondary", fontSize: 14 }}>
        時間単位休暇は無効です。
      </Stack>
    ) : (
      <>
        <Label>時間単位休暇</Label>
        {hourlyPaidHolidayTimeFields.length === 0 && (
          <Stack sx={{ color: "text.secondary", fontSize: 14 }}>
            時間帯を追加してください。
          </Stack>
        )}
        {hourlyPaidHolidayTimeFields.map((time, index) => (
          <HourlyPaidHolidayTimeItemMobile
            key={time.id}
            time={time}
            index={index}
          />
        ))}
        <Stack>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            fullWidth
            onClick={() => {
              if (hourlyPaidHolidayTimeAppend) {
                hourlyPaidHolidayTimeAppend({
                  startTime: null,
                  endTime: null,
                });
              }
            }}
          >
            追加
          </Button>
        </Stack>
      </>
    ),
  });

  items.push({
    label: "振替休暇",
    content: <SubstituteHolidayDateInput />,
  });

  return (
    <VacationTabs
      value={holidayTab}
      onChange={setHolidayTab}
      items={items}
      panelPadding={1}
      tabsProps={{ variant: "fullWidth", sx: { mb: 1 } }}
    />
  );
}
