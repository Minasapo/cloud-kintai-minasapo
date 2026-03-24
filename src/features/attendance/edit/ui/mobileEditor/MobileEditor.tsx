import QuickInputButtonsMobile from "@features/attendance/edit/ui/QuickInputButtonsMobile";
import GroupContainerMobile from "@shared/ui/group-container/GroupContainerMobile";
import { useContext, useMemo, useState } from "react";
import { useFormState } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import { collectAttendanceErrorMessages } from "@/entities/attendance/validation/collectErrorMessages";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { AttendanceEditPageHeader } from "@/features/attendance/edit/ui/components/AttendanceEditPageHeader";
import { AttendanceErrorSummary } from "@/features/attendance/edit/ui/components/AttendanceErrorSummary";

import AttendanceEditBreadcrumb from "../AttendanceEditBreadcrumb";
import ChangeRequestingAlert from "../desktopEditor/ChangeRequestingMessage";
import NoDataAlert from "../desktopEditor/NoDataAlert";
import RemarksInput from "./RemarksInput";
import { RequestButtonItem } from "./RequestButtonItem";
import { RestTimeInput } from "./RestTimeInput/RestTimeInput";
import StaffCommentInput from "./StaffCommentInput";
import { StaffNameItem } from "./StaffNameItem";
import { TabbedPaidHolidayMobile } from "./TabbedPaidHolidayMobile";
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
  const { errors } = useFormState({ control });
  const contextErrorMessages = ctx.errorMessages;
  const derivedMessages = useMemo(
    () => collectAttendanceErrorMessages(errors),
    [errors],
  );
  const errorMessages = contextErrorMessages?.length
    ? contextErrorMessages
    : derivedMessages;
  const [holidayTab, setHolidayTab] = useState<number>(0);

  // memoize the component reference to avoid recreating it on each render
  const TabbedPaidHolidayComponent = useMemo(() => TabbedPaidHolidayMobile, []);

  if (changeRequests.length > 0) {
    return (
      <div className="flex flex-col gap-2 p-2">
        <AttendanceEditPageHeader
          breadcrumb={<AttendanceEditBreadcrumb />}
          variant="mobile"
        />
        <AttendanceErrorSummary messages={errorMessages} variant="mobile" />
        <ChangeRequestingAlert changeRequests={changeRequests} />
      </div>
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
    <div className="flex flex-col gap-2 p-2 pb-10">
      <AttendanceEditPageHeader
        breadcrumb={<AttendanceEditBreadcrumb />}
        description="勤務時間や休憩、休暇、備考を確認しながら、そのまま修正申請できます。"
        variant="mobile"
      />
      <AttendanceErrorSummary messages={errorMessages} variant="mobile" />
      <div className="flex flex-col gap-2">
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
        <GroupContainerMobile hideAccent hideBorder>
          {/* 勤務日 */}
          <WorkDateItem />
        </GroupContainerMobile>
        <GroupContainerMobile hideAccent hideBorder>
          {/* スタッフ・勤務形態 */}
          <StaffNameItem />
          <WorkTypeItemMobile />
        </GroupContainerMobile>
        <GroupContainerMobile hideAccent hideBorder>
          <div className="flex flex-col gap-2">
            {/* 勤務時間・休憩時間 */}
            <WorkTimeInput />
            <RestTimeInput
              restFields={restFields}
              restAppend={restAppend}
              restRemove={restRemove}
              restUpdate={restUpdate}
            />
          </div>
        </GroupContainerMobile>
        <GroupContainerMobile hideAccent hideBorder>
          {/* 休暇タブ */}
          <TabbedPaidHolidayComponent
            control={control}
            setValue={setValue}
            workDate={workDate}
            restReplace={restReplace}
            getValues={getValues}
            getSpecialHolidayEnabled={getSpecialHolidayEnabled}
            changeRequestsLength={changeRequests.length}
            hourlyPaidHolidayEnabled={hourlyPaidHolidayEnabled}
            hourlyPaidHolidayTimeFields={hourlyPaidHolidayTimeFields}
            hourlyPaidHolidayTimeAppend={hourlyPaidHolidayTimeAppend}
            holidayTab={holidayTab}
            setHolidayTab={setHolidayTab}
          />
        </GroupContainerMobile>
        <GroupContainerMobile title="備考" hideAccent hideBorder>
          <RemarksInput />
        </GroupContainerMobile>
        <GroupContainerMobile title="修正理由" hideAccent hideBorder>
          <StaffCommentInput />
        </GroupContainerMobile>
        <RequestButtonItem
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          isDirty={isDirty}
          isValid={isValid}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
