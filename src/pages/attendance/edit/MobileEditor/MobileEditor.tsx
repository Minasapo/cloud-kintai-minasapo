import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import GroupContainerMobile from "@shared/ui/group-container/GroupContainerMobile";
import Title from "@shared/ui/typography/Title";
import React, { useContext, useState } from "react";
import { Controller } from "react-hook-form";

import HourlyPaidHolidayTimeItemMobile from "@/components/attendance_editor/items/HourlyPaidHolidayTimeItemMobile";
import PaidHolidayFlagInputMobile from "@/components/attendance_editor/PaidHolidayFlagInputMobile";
import QuickInputButtonsMobile from "@/components/attendance_editor/QuickInputButtonsMobile";
import { AppConfigContext } from "@/context/AppConfigContext";

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
  const ctx = useContext(AttendanceEditContext);
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
    hourlyPaidHolidayEnabled,
    hourlyPaidHolidayTimeFields,
    hourlyPaidHolidayTimeAppend,
    hourlyPaidHolidayTimeReplace,
    restReplace,
    workDate,
  } = ctx;
  const { getSpecialHolidayEnabled } = useContext(AppConfigContext);

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

  const [holidayTab, setHolidayTab] = useState<number>(0);

  // タブパネル
  const TabPanel = ({
    children,
    value,
    index,
  }: {
    children?: React.ReactNode;
    value: number;
    index: number;
  }) => {
    return value === index ? <Box sx={{ pt: 1 }}>{children}</Box> : null;
  };
  TabPanel.displayName = "TabPanel";

  // 休暇タブ（AppConfigのフラグで特別休暇タブを表示制御）
  const TabbedPaidHoliday = () => {
    const tabs: { label: string; panel: JSX.Element }[] = [];
    // 有給
    tabs.push({
      label: "有給休暇",
      panel: (
        <TabPanel value={holidayTab} index={tabs.length}>
          <PaidHolidayFlagInputMobile
            control={control}
            setValue={setValue}
            workDate={workDate ? workDate.format("YYYY-MM-DD") : undefined}
            setPaidHolidayTimes={true}
            restReplace={restReplace}
            getValues={getValues}
          />
        </TabPanel>
      ),
    });

    // 特別休暇（フラグが有効な場合のみ）
    if (getSpecialHolidayEnabled && getSpecialHolidayEnabled()) {
      tabs.push({
        label: "特別休暇",
        panel: (
          <TabPanel value={holidayTab} index={tabs.length}>
            {/* 他の休暇項目と同様にラベルを上に配置し、内容は縦並びにする */}
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
                        disabled={changeRequests.length > 0}
                      />
                    }
                    label=""
                  />
                )}
              />
            </Stack>
          </TabPanel>
        ),
      });
    }

    // 時間休暇
    tabs.push({
      label: "時間休暇",
      panel: (
        <TabPanel value={holidayTab} index={tabs.length}>
          {!hourlyPaidHolidayEnabled ? (
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
      ),
    });

    // 振替休暇
    tabs.push({
      label: "振替休暇",
      panel: (
        <TabPanel value={holidayTab} index={tabs.length}>
          <SubstituteHolidayDateInput />
        </TabPanel>
      ),
    });

    return (
      <>
        <Tabs
          value={holidayTab}
          onChange={(_, v) => setHolidayTab(v)}
          variant="fullWidth"
          sx={{ mb: 1 }}
        >
          {tabs.map((t, i) => (
            <Tab key={i} label={t.label} />
          ))}
        </Tabs>
        {tabs.map((t, i) => (
          <div key={`panel-${i}`}>{t.panel}</div>
        ))}
      </>
    );
  };
  TabbedPaidHoliday.displayName = "TabbedPaidHoliday";

  return (
    <Stack direction="column" spacing={1} sx={{ p: 1, pb: 10 }}>
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
          {/* スタッフ・勤務形態 */}
          <StaffNameItem />
          <WorkTypeItemMobile />
        </GroupContainerMobile>
        <GroupContainerMobile>
          <Stack spacing={1}>
            {/* 勤務時間・休憩時間 */}
            <WorkTimeInput />
            <RestTimeInput
              restFields={restFields}
              restAppend={restAppend}
              restRemove={restRemove}
              restUpdate={restUpdate}
            />
          </Stack>
        </GroupContainerMobile>
        <GroupContainerMobile>
          {/* 休暇タブ */}
          <TabbedPaidHoliday />
        </GroupContainerMobile>
        <GroupContainerMobile title="備考">
          <RemarksInput />
        </GroupContainerMobile>
        <GroupContainerMobile title="修正理由">
          <StaffCommentInput />
        </GroupContainerMobile>
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
