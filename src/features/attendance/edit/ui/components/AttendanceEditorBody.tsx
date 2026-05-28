import { type UpdateAttendanceMutationArg } from "@entities/attendance/api/attendanceApi";
import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import { AttendanceEditContext } from "@features/attendance/edit/model/AttendanceEditProvider";
import { type AttendanceEditInputs } from "@features/attendance/edit/model/common";
import { AttendanceVacationTabs } from "@features/attendance/edit/ui/components/AttendanceVacationTabs";
import { type Attendance, type AttendanceHistory } from "@shared/api/graphql/types";
import { type Logger } from "@shared/lib/logger";
import { createMonthSearchParams, MONTH_QUERY_KEY } from "@shared/lib/monthQuery";
import GroupContainer from "@shared/ui/group-container/GroupContainer";
import { useCallback, useContext, useState } from "react";
import { type UseFormHandleSubmit } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ChangeRequestDialog from "../ChangeRequestDialog/ChangeRequestDialog";
import RemarksItem from "../items/RemarksItem";
import WorkDateItem from "../items/WorkDateItem";
import MoveDateItem from "../MoveDateItem";
import { AttendanceEditFormSkeleton } from "./AttendanceEditFormSkeleton";
import { AttendanceEditorAdditionalBottomContent } from "./AttendanceEditorAdditionalBottomContent";
import { AttendanceEditorAlerts } from "./AttendanceEditorAlerts";
import { AttendanceEditorEditActions } from "./AttendanceEditorEditActions";
import { AttendanceEditorHeader } from "./AttendanceEditorHeader";
import { AttendanceEditorHistorySidebar } from "./AttendanceEditorHistorySidebar";
import { AttendanceEditorSaveAction } from "./AttendanceEditorSaveAction";

type AttendanceEditorBodyProps = {
  dialog: React.ReactNode;
  attendanceListPath: string;
  sortedHistories: AttendanceHistory[];
  historyIndex: number;
  historiesLoading: boolean;
  setHistoryIndex: (idx: number) => void;
  applyHistory: (idx: number) => void;
  logger: Logger;
  overtimeError: string | null;
  totalProductionTime: number;
  totalHourlyPaidHolidayTime: number;
  highlightStartTime: boolean;
  handleGoDirectlyChange?: (checked: boolean) => void;
  getAbsentEnabled: () => boolean;
  getSpecialHolidayEnabled: () => boolean;
  getHourlyPaidHolidayEnabled: () => boolean;
  handleAbsentFlagChange: (checked: boolean) => void;
  handleSpecialHolidayFlagChange: (checked: boolean) => void;
  handleSubmit: UseFormHandleSubmit<AttendanceEditInputs>;
  handleUpdateAttendance: (input: UpdateAttendanceMutationArg) => Promise<Attendance>;
  enabledSendMail: boolean;
  onToggleSendMail: () => void;
};

export function AttendanceEditorBody({
  dialog,
  attendanceListPath,
  sortedHistories,
  historyIndex,
  historiesLoading,
  setHistoryIndex,
  applyHistory,
  logger,
  overtimeError,
  totalProductionTime,
  totalHourlyPaidHolidayTime,
  highlightStartTime,
  handleGoDirectlyChange,
  getAbsentEnabled,
  getSpecialHolidayEnabled,
  getHourlyPaidHolidayEnabled,
  handleAbsentFlagChange,
  handleSpecialHolidayFlagChange,
  handleSubmit,
  handleUpdateAttendance,
  enabledSendMail,
  onToggleSendMail,
}: AttendanceEditorBodyProps) {
  const {
    workDate,
    attendance,
    staff,
    onSubmit,
    isSubmitting,
    isValid,
    isDirty,
    errorMessages,
    submitErrorMessage,
    changeRequests,
    control,
    setValue,
    getValues,
    restReplace,
    hourlyPaidHolidayTimeReplace,
    hourlyPaidHolidayTimeFields,
    hourlyPaidHolidayTimeAppend,
    readOnly,
  } = useContext(AttendanceEditContext);

  const [vacationTab, setVacationTab] = useState(0);
  const [highlightEndTime, setHighlightEndTime] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { staffId: targetStaffId, targetWorkDate } = useParams();

  const handleSelectHistory = useCallback(
    (idx: number) => {
      setHistoryIndex(idx);
      try {
        applyHistory(idx);
      } catch (error) {
        logger.debug("Failed to apply attendance history", error);
      }
    },
    [setHistoryIndex, applyHistory, logger],
  );

  const onBackToEdit = readOnly
    ? () => {
        const date = workDate
          ? workDate.format(AttendanceDate.DataFormat)
          : targetWorkDate;
        const sid = targetStaffId;
        if (date && sid) {
          const month = searchParams.get(MONTH_QUERY_KEY);
          const editPath = `/admin/attendances/edit/${date}/${sid}`;
          if (!month) {
            navigate(editPath);
            return;
          }
          navigate(`${editPath}?${createMonthSearchParams(month).toString()}`);
        }
      }
    : undefined;

  return (
    <>
      {dialog}
      <div
        className="flex flex-col gap-2 pb-5"
        data-testid="admin-attendance-editor-root"
      >
        {isSubmitting && (
          <div className="mt-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full w-1/3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="mt-1 text-center text-sm text-slate-600">保存中...</p>
          </div>
        )}
        <AttendanceEditorHeader
          workDate={workDate ?? null}
          onBackToAttendanceList={() => {
            navigate(attendanceListPath);
          }}
          readOnly={readOnly}
          currentHistoryCreatedAt={sortedHistories[historyIndex]?.createdAt}
          onBackToEdit={onBackToEdit}
        />
        <div className={readOnly ? "mt-1 flex items-start gap-2" : undefined}>
          {readOnly && (
            <AttendanceEditorHistorySidebar
              historiesLoading={historiesLoading}
              sortedHistories={sortedHistories}
              historyIndex={historyIndex}
              onSelectHistory={handleSelectHistory}
            />
          )}
          <div className="grow">
            <div className="flex flex-col gap-2 px-[120px]">
              <AttendanceEditorAlerts
                errorMessages={errorMessages ?? []}
                submitErrorMessage={submitErrorMessage}
                overtimeError={overtimeError}
                showNoDataAlert={!attendance}
              />
              <AttendanceEditorEditActions
                readOnly={readOnly}
                setValue={setValue!}
                restReplace={restReplace!}
                hourlyPaidHolidayTimeReplace={hourlyPaidHolidayTimeReplace}
                workDate={workDate ?? null}
                getValues={getValues!}
              />
              <GroupContainer hideAccent hideBorder>
                <div>
                  <WorkDateItem
                    staffId={targetStaffId}
                    workDate={workDate ?? null}
                    MoveDateItemComponent={MoveDateItem}
                  />
                </div>
              </GroupContainer>
              <AttendanceEditFormSkeleton
                control={control!}
                highlightStartTime={highlightStartTime}
                highlightEndTime={highlightEndTime}
                onHighlightEndTime={setHighlightEndTime}
                totalProductionTime={totalProductionTime}
                totalHourlyPaidHolidayTime={totalHourlyPaidHolidayTime}
                readOnly={readOnly}
                changeRequests={changeRequests}
                onGoDirectlyChange={handleGoDirectlyChange}
                vacationTabsContent={
                  <AttendanceVacationTabs
                    value={vacationTab}
                    onChange={setVacationTab}
                    control={control!}
                    setValue={setValue!}
                    getValues={getValues!}
                    restReplace={restReplace!}
                    workDateIso={workDate ? workDate.toISOString() : undefined}
                    readOnly={readOnly}
                    changeRequestsLength={changeRequests.length}
                    getAbsentEnabled={getAbsentEnabled}
                    getSpecialHolidayEnabled={getSpecialHolidayEnabled}
                    getHourlyPaidHolidayEnabled={getHourlyPaidHolidayEnabled}
                    handleAbsentFlagChange={handleAbsentFlagChange}
                    handleSpecialHolidayFlagChange={handleSpecialHolidayFlagChange}
                    hourlyPaidHolidayTimeFields={hourlyPaidHolidayTimeFields}
                    hourlyPaidHolidayTimeAppend={hourlyPaidHolidayTimeAppend}
                    staffWorkType={staff?.workType}
                  />
                }
                remarksContent={<RemarksItem />}
                additionalBottomContent={
                  !readOnly ? (
                    <AttendanceEditorAdditionalBottomContent
                      updatedAt={attendance?.updatedAt}
                      enabledSendMail={enabledSendMail}
                      onToggleSendMail={onToggleSendMail}
                    />
                  ) : undefined
                }
              />
              <AttendanceEditorSaveAction
                readOnly={readOnly}
                onSave={handleSubmit(onSubmit)}
                disabled={!isValid || !isDirty || isSubmitting || !!overtimeError}
                loading={isSubmitting}
              />
            </div>
          </div>
        </div>
        <ChangeRequestDialog
          attendance={attendance ?? null}
          updateAttendance={handleUpdateAttendance}
          staff={staff}
        />
      </div>
    </>
  );
}
