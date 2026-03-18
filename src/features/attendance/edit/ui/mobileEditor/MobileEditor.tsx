import QuickInputButtonsMobile from "@features/attendance/edit/ui/QuickInputButtonsMobile";
import GroupContainerMobile from "@shared/ui/group-container/GroupContainerMobile";
import { useContext, useMemo, useState } from "react";
import { useFormState } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import { collectAttendanceErrorMessages } from "@/entities/attendance/validation/collectErrorMessages";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

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
        <div className="rounded-[24px] border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(247,252,248,0.98)_0%,rgba(236,253,245,0.92)_58%,rgba(255,255,255,0.98)_100%)] p-2.5 shadow-[0_24px_54px_-40px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-1.5">
            <AttendanceEditBreadcrumb />
            <h1 className="m-0 text-[1.9rem] font-bold leading-[1.15] tracking-[-0.02em] text-slate-950">
              勤怠編集
            </h1>
          </div>
        </div>
        {errorMessages.length > 0 && (
          <div className="rounded-[18px] border border-rose-500/15 bg-rose-50/90 px-4 py-3">
            <div className="text-sm font-semibold text-rose-900">入力内容に誤りがあります。</div>
            <div className="mt-2 flex flex-col gap-1">
                {errorMessages.map((message) => (
                  <div key={message} className="text-sm text-rose-900">
                    {message}
                  </div>
                ))}
            </div>
          </div>
        )}
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
      <div className="rounded-[24px] border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(247,252,248,0.98)_0%,rgba(236,253,245,0.92)_58%,rgba(255,255,255,0.98)_100%)] p-2.5 shadow-[0_24px_54px_-40px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-1.5">
          <AttendanceEditBreadcrumb />
          <h1 className="m-0 text-[1.9rem] font-bold leading-[1.15] tracking-[-0.02em] text-slate-950">
            勤怠編集
          </h1>
          <p className="leading-8 text-slate-500">
            勤務時間や休憩、休暇、備考を確認しながら、そのまま修正申請できます。
          </p>
        </div>
      </div>
      {errorMessages.length > 0 && (
        <div className="rounded-[18px] border border-rose-500/15 bg-rose-50/90 px-4 py-3">
          <div className="text-sm font-semibold text-rose-900">入力内容に誤りがあります。</div>
          <div className="mt-2 flex flex-col gap-1">
              {errorMessages.map((message) => (
                <div key={message} className="text-sm text-rose-900">
                  {message}
                </div>
              ))}
          </div>
        </div>
      )}
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
