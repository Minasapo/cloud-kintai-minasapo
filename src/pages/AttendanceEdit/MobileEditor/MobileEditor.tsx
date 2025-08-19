import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Button, Stack } from "@mui/material";
import { useContext } from "react";

import PaidHolidayFlagInputMobile from "@/components/attendance_editor/PaidHolidayFlagInputMobile";

import Title from "../../../components/Title/Title";
import AttendanceEditBreadcrumb from "../AttendanceEditBreadcrumb";
import { AttendanceEditContext } from "../AttendanceEditProvider";
import ChangeRequestingAlert from "../DesktopEditor/ChangeRequestingMessage";
import NoDataAlert from "../DesktopEditor/NoDataAlert";
import { GoDirectlyFlagInput } from "./GoDirectlyFlagInput";
import { Label } from "./Label";
import RemarksInput from "./RemarksInput";
import { RequestButtonItem } from "./RequestButtonItem";
import { RestTimeInput } from "./RestTimeInput/RestTimeInput";
import { ReturnDirectlyFlagInput } from "./ReturnDirectlyFlagInput";
import StaffCommentInput from "./StaffCommentInput";
import { StaffNameItem } from "./StaffNameItem";
import { SubstituteHolidayDateInput } from "./SubstituteHolidayDateInput";
import { WorkDateItem } from "./WorkDateItem";
import { WorkTimeInput } from "./WorkTimeInput/WorkTimeInput";

export function MobileEditor() {
  const {
    staff,
    onSubmit,
    control,
    setValue,
    getValues,
    watch,
    register,
    handleSubmit,
    isDirty,
    isValid,
    isSubmitting,
    restFields,
    restAppend,
    restRemove,
    restUpdate,
    changeRequests,
  } = useContext(AttendanceEditContext);
  const {
    hourlyPaidHolidayEnabled,
    hourlyPaidHolidayTimeFields,
    hourlyPaidHolidayTimeAppend,
  } = useContext(AttendanceEditContext);

  if (changeRequests.length > 0) {
    return (
      <Stack direction="column" spacing={1} sx={{ p: 1 }}>
        <AttendanceEditBreadcrumb />
        <Title>勤怠編集</Title>
        <ChangeRequestingAlert changeRequests={changeRequests} />
      </Stack>
    );
  }

  if (
    !staff ||
    !control ||
    !setValue ||
    !watch ||
    !getValues ||
    !handleSubmit ||
    !register ||
    !restAppend ||
    !restRemove ||
    !restUpdate
  ) {
    return null;
  }

  return (
    <Stack direction="column" spacing={1} sx={{ p: 1 }}>
      <AttendanceEditBreadcrumb />
      <Title>勤怠編集</Title>
      <Stack direction="column" spacing={2} sx={{ p: 1 }}>
        <NoDataAlert />
        {/* 勤務日 */}
        <WorkDateItem />
        {/* スタッフ */}
        <StaffNameItem />
        {/* 有給休暇 */}
        <PaidHolidayFlagInputMobile control={control} setValue={setValue} />
        {/* 時間単位休暇 */}
        {hourlyPaidHolidayEnabled && (
          <Stack direction="column" spacing={1}>
            <Label>時間単位休暇({hourlyPaidHolidayTimeFields.length}件)</Label>
            {hourlyPaidHolidayTimeFields.length === 0 && (
              <Stack sx={{ color: "text.secondary", fontSize: 14 }}>
                時間単位休暇の時間帯を追加してください。
              </Stack>
            )}
            {hourlyPaidHolidayTimeFields.map((item) => (
              <div key={item.id}>
                {/* 時間単位休暇の入力欄コンポーネントをここに追加 */}
                {/* 例: <HourlyPaidHolidayTimeItemMobile ... /> */}
              </div>
            ))}
            <Stack>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                fullWidth
                onClick={() =>
                  hourlyPaidHolidayTimeAppend({
                    startTime: null,
                    endTime: null,
                  })
                }
              >
                追加
              </Button>
            </Stack>
          </Stack>
        )}
        {/* 振替休暇 */}
        <SubstituteHolidayDateInput />
        {/* 直行 */}
        <GoDirectlyFlagInput />
        {/* 直帰 */}
        <ReturnDirectlyFlagInput control={control} />
        {/* 勤務時間 */}
        <WorkTimeInput />
        {/* 休憩時間 */}
        <RestTimeInput
          restFields={restFields}
          control={control}
          restAppend={restAppend}
          restRemove={restRemove}
          restUpdate={restUpdate}
        />
        {/* 備考 */}
        <Label>備考</Label>
        <RemarksInput register={register} />
        {/* 修正コメント */}
        <Label>修正理由</Label>
        <StaffCommentInput />
        {/* 申請ボタン */}
        <RequestButtonItem
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          isDirty={isDirty}
          isValid={isValid}
          isSubmitting={isSubmitting}
        />
      </Stack>
    </Stack>
  );
}
