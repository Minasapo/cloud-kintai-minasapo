import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Button, Stack, Tab, Tabs } from "@mui/material";
import React, { useContext, useState } from "react";

import HourlyPaidHolidayTimeItemMobile from "@/components/attendance_editor/items/HourlyPaidHolidayTimeItemMobile";
import PaidHolidayFlagInputMobile from "@/components/attendance_editor/PaidHolidayFlagInputMobile";
import QuickInputButtonsMobile from "@/components/attendance_editor/QuickInputButtonsMobile";
import GroupContainerMobile from "@/components/ui/GroupContainer/GroupContainerMobile";

import Title from "../../../components/Title/Title";
import AttendanceEditBreadcrumb from "../AttendanceEditBreadcrumb";
import { AttendanceEditContext } from "../AttendanceEditProvider";
import ChangeRequestingAlert from "../DesktopEditor/ChangeRequestingMessage";
import NoDataAlert from "../DesktopEditor/NoDataAlert";
import { Label } from "./Label";
import RemarksInput from "./RemarksInput";
import { RequestButtonItem } from "./RequestButtonItem";
import { RestTimeInput } from "./RestTimeInput/RestTimeInput";
import StaffCommentInput from "./StaffCommentInput";
import { StaffNameItem } from "./StaffNameItem";
import { SubstituteHolidayDateInput } from "./SubstituteHolidayDateInput";
import { WorkDateItem } from "./WorkDateItem";
import { WorkTimeInput } from "./WorkTimeInput/WorkTimeInput";
import WorkTypeItemMobile from "./WorkTypeItemMobile";

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
    hourlyPaidHolidayTimeReplace,
    restReplace,
    workDate,
  } = useContext(AttendanceEditContext);

  // タブ用の state とコンポーネントは、以下の guard の後に定義して
  // control 等の型が絞られていることを保証します。

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

  // タブ状態（休暇系）
  const [holidayTab, setHolidayTab] = useState<number>(0);

  type TabPanelProps = {
    children?: React.ReactNode;
    value: number;
    index: number;
  };

  const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) =>
    value === index ? <Box sx={{ pt: 1 }}>{children}</Box> : null;

  const TabbedPaidHoliday: React.FC = () => (
    <>
      <Tabs
        value={holidayTab}
        onChange={(_, v) => setHolidayTab(v)}
        variant="fullWidth"
        sx={{ mb: 1 }}
      >
        <Tab label="有給休暇" />
        <Tab label="時間休暇" disabled={!hourlyPaidHolidayEnabled} />
        <Tab label="振替休暇" />
      </Tabs>

      <TabPanel value={holidayTab} index={0}>
        <PaidHolidayFlagInputMobile control={control} setValue={setValue} />
      </TabPanel>

      <TabPanel value={holidayTab} index={1}>
        {!hourlyPaidHolidayEnabled ? (
          <Stack sx={{ color: "text.secondary", fontSize: 14 }}>
            時間単位休暇は無効です。
          </Stack>
        ) : (
          <>
            <Label>時間単位休暇</Label>
            {hourlyPaidHolidayTimeFields.length === 0 && (
              <Stack sx={{ color: "text.secondary", fontSize: 14 }}>
                時間単位休暇の時間帯を追加してください。
              </Stack>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {hourlyPaidHolidayTimeFields.map(
              (hourlyPaidHolidayTime: any, index: number) => (
                <HourlyPaidHolidayTimeItemMobile
                  key={hourlyPaidHolidayTime.id}
                  time={hourlyPaidHolidayTime}
                  index={index}
                />
              )
            )}
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
          </>
        )}
      </TabPanel>

      <TabPanel value={holidayTab} index={2}>
        <SubstituteHolidayDateInput />
      </TabPanel>
    </>
  );

  return (
    <Stack direction="column" spacing={1} sx={{ p: 1 }}>
      <AttendanceEditBreadcrumb />
      <Title>勤怠編集</Title>
      <Stack direction="column" spacing={2} sx={{ p: 1 }}>
        <NoDataAlert />
        {setValue && restReplace && hourlyPaidHolidayTimeReplace && (
          <QuickInputButtonsMobile
            setValue={setValue}
            restReplace={restReplace}
            hourlyPaidHolidayTimeReplace={hourlyPaidHolidayTimeReplace}
            workDate={workDate ?? null}
            visibleMode="staff"
          />
        )}
        <GroupContainerMobile>
          {/* 勤務日 */}
          <WorkDateItem />
        </GroupContainerMobile>

        <GroupContainerMobile>
          {/* スタッフ */}
          <StaffNameItem />
          {/* 勤務形態 */}
          <WorkTypeItemMobile />
        </GroupContainerMobile>

        <GroupContainerMobile>
          <Stack spacing={1}>
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
          </Stack>
        </GroupContainerMobile>

        <GroupContainerMobile>
          {/* 休暇(有給休暇/時間単位休暇/振替休暇) */}
          <TabbedPaidHoliday />
        </GroupContainerMobile>

        <GroupContainerMobile title="備考">
          <RemarksInput register={register} />
        </GroupContainerMobile>

        {/* スタッフコメント */}
        <GroupContainerMobile title="修正理由">
          <StaffCommentInput />
        </GroupContainerMobile>

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
