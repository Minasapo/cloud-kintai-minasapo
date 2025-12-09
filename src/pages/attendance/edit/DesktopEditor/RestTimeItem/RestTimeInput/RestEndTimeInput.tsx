import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, Stack } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext } from "react";
import { Controller, FieldArrayWithId } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceDateTime } from "@/lib/AttendanceDateTime";
import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";

import { AttendanceEditInputs } from "../../../common";

/**
 * 休憩終了時刻の入力コンポーネント。
 * @param rest 休憩データ
 * @param index 休憩配列のインデックス
 * @returns JSX.Element | null
 */
export default function RestEndTimeInput({
  rest,
  index,
  testIdPrefix = "desktop",
}: {
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  index: number;
  testIdPrefix?: string;
}) {
  const { workDate, control, restUpdate, changeRequests } = useContext(
    AttendanceEditContext
  );

  if (!workDate || !control || !restUpdate) return null;

  return (
    <Stack direction="row" spacing={1}>
      <Stack spacing={1}>
        <Controller
          name={`rests.${index}.endTime`}
          control={control}
          render={({ field }) => (
            <TimePicker
              value={rest.endTime ? dayjs(rest.endTime) : null}
              ampm={false}
              disabled={changeRequests.length > 0}
              slotProps={{
                textField: {
                  size: "small",
                  inputProps: {
                    "data-testid": `rest-end-time-input-${testIdPrefix}-${index}`,
                  },
                },
              }}
              onChange={(newEndTime) => {
                if (!newEndTime) {
                  field.onChange(null);
                  return;
                }

                if (!newEndTime.isValid()) {
                  return;
                }

                const formattedEndTime = newEndTime
                  .year(workDate.year())
                  .month(workDate.month())
                  .date(workDate.date())
                  .second(0)
                  .millisecond(0)
                  .toISOString();
                field.onChange(formattedEndTime);
              }}
            />
          )}
        />
        <Box>
          <DefaultEndTimeChip index={index} rest={rest} />
        </Box>
      </Stack>
    </Stack>
  );
}

/**
 * デフォルトの休憩終了時刻を設定するチップコンポーネント。
 * @param index 休憩配列のインデックス
 * @param rest 休憩データ
 * @returns JSX.Element | null
 */
function DefaultEndTimeChip({
  index,
  rest,
}: {
  index: number;
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
}) {
  const { workDate, restUpdate, changeRequests } = useContext(
    AttendanceEditContext
  );
  const { getLunchRestEndTime } = useContext(AppConfigContext);

  const lunchRestEndTime = getLunchRestEndTime().format("H:mm");

  if (!workDate || !restUpdate) return null;

  const clickHandler = () => {
    const endTime = new AttendanceDateTime()
      .setDate(workDate)
      .setRestEnd()
      .toISOString();
    restUpdate(index, { ...rest, endTime });
  };

  return (
    <Chip
      label={lunchRestEndTime}
      variant="outlined"
      color="success"
      disabled={changeRequests.length > 0}
      icon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
      onClick={clickHandler}
      data-testid={`rest-lunch-end-chip-${index}`}
    />
  );
}
