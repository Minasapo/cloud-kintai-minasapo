import useAppConfig from "@entities/app-config/model/useAppConfig";
import {
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
} from "@entities/attendance/api/attendanceApi";
import { useOvertimeRequest } from "@entities/attendance/hooks/useOvertimeRequest";
import { attendanceEditSchema } from "@entities/attendance/validation/attendanceEditSchema";
import { collectAttendanceErrorMessages } from "@entities/attendance/validation/collectErrorMessages";
import {
  type OvertimeCheckContext,
  validateOvertimeCheck,
} from "@entities/attendance/validation/overtimeCheckValidator";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { zodResolver } from "@hookform/resolvers/zod";
import AddAlarmIcon from "@mui/icons-material/AddAlarm";
import {
  Checkbox,
  LinearProgress,
} from "@mui/material";
import {
  HourlyPaidHolidayTimeInput,
} from "@shared/api/graphql/types";
import GroupContainer from "@shared/ui/group-container/GroupContainer";
import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { AttendanceDateTime } from "@/entities/attendance/lib/AttendanceDateTime";
import { resolveConfigTimeOnDate } from "@/entities/attendance/lib/resolveConfigTimeOnDate";
import * as MESSAGE_CODE from "@/errors";
import AttendanceEditProvider from "@/features/attendance/edit/model/AttendanceEditProvider";
import {
  AttendanceEditInputs,
  defaultValues,
  HourlyPaidHolidayTimeInputs,
  RestInputs,
} from "@/features/attendance/edit/model/common";
import { AttendanceErrorSummary } from "@/features/attendance/edit/ui/components/AttendanceErrorSummary";
import { SubstituteHolidayDateInput } from "@/features/attendance/edit/ui/items/SubstituteHolidayDateInput";
import useAuthenticatedUser from "@/hooks/useAuthenticatedUser";
import { Logger } from "@/shared/lib/logger";
import { AttendanceEditMailSender } from "@/shared/lib/mail/AttendanceEditMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";
import { AppButton, AppIconButton } from "@/shared/ui/button";

import { useAttendanceRecord } from "../model/useAttendanceRecord";
import ChangeRequestDialog from "./ChangeRequestDialog/ChangeRequestDialog";
import { AttendanceEditFormSkeleton } from "./components/AttendanceEditFormSkeleton";
import { VacationTabs } from "./components/VacationTabs";
// eslint-disable-next-line import/no-cycle
import EditAttendanceHistoryList from "./EditAttendanceHistoryList/EditAttendanceHistoryList";
import IsDeemedHolidayFlagInput from "./IsDeemedHolidayFlagInput";
import HourlyPaidHolidayTimeItem, {
  calcTotalHourlyPaidHolidayTime,
} from "./items/HourlyPaidHolidayTimeItem";
// eslint-disable-next-line import/no-cycle
import RemarksItem from "./items/RemarksItem";
// eslint-disable-next-line import/no-cycle
import { calcTotalRestTime } from "./items/RestTimeItem/RestTimeItem";
import WorkDateItem from "./items/WorkDateItem";
import { calcTotalWorkTime } from "./items/WorkTimeItem/WorkTimeItem";
import MoveDateItem from "./MoveDateItem";
import PaidHolidayFlagInputCommon from "./PaidHolidayFlagInput";
import QuickInputButtons from "./QuickInputButtons";
import { SystemCommentList } from "./SystemCommentList";

function InlineAlert({
  tone,
  title,
  children,
}: {
  tone: "error" | "info";
  title?: string;
  children: React.ReactNode;
}) {
  const toneClassName =
    tone === "error"
      ? "border-rose-500/15 bg-rose-50/90 text-rose-900"
      : "border-sky-500/15 bg-sky-50/90 text-sky-900";

  return (
    <div className={`rounded-[18px] border px-4 py-3 ${toneClassName}`}>
      {title ? <div className="text-sm font-semibold">{title}</div> : null}
      <div className={title ? "mt-2 text-sm" : "text-sm"}>{children}</div>
    </div>
  );
}

function buildHourlyPaidHolidayTimes(
  data: HourlyPaidHolidayTimeInputs[] | undefined,
): HourlyPaidHolidayTimeInput[] {
  if (!data) {
    return [];
  }

  return data.reduce<HourlyPaidHolidayTimeInput[]>((acc, item) => {
    // 必須フィールドが両方揃っている場合のみ追加
    if (item.startTime && item.endTime) {
      acc.push({
        startTime: item.startTime,
        endTime: item.endTime,
      });
    }
    return acc;
  }, []);
}

export default function AttendanceEditor({ readOnly }: { readOnly?: boolean }) {
  const {
    getLunchRestStartTime,
    getLunchRestEndTime,
    getHourlyPaidHolidayEnabled,
    getSpecialHolidayEnabled,
    getStartTime,
    getEndTime,
    getAbsentEnabled,
    loading: appConfigLoading,
    config: appConfig,
  } = useAppConfig();
  const dispatch = useDispatch();
  const { authenticatedUser } = useAuthenticatedUser();

  const { targetWorkDate, staffId: targetStaffId } = useParams();
  const navigate = useNavigate();
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { loading: staffsLoading, error: staffSError } = useStaffs({
    isAuthenticated,
  });
  const [createAttendanceMutation] = useCreateAttendanceMutation();
  const [updateAttendanceMutation] = useUpdateAttendanceMutation();

  const handleUpdateAttendance = useCallback(
    (input: Parameters<typeof updateAttendanceMutation>[0]) =>
      updateAttendanceMutation(input).unwrap(),
    [updateAttendanceMutation],
  );

  const handleCreateAttendance = useCallback(
    (input: Parameters<typeof createAttendanceMutation>[0]) =>
      createAttendanceMutation(input).unwrap(),
    [createAttendanceMutation],
  );
  const [enabledSendMail, setEnabledSendMail] = useState<boolean>(true);
  const [vacationTab, setVacationTab] = useState<number>(0);
  const [highlightStartTime, setHighlightStartTime] = useState(false);
  const [highlightEndTime, setHighlightEndTime] = useState(false);
  const [overtimeError, setOvertimeError] = useState<string | null>(null);

  const logger = useMemo(
    () =>
      new Logger("AttendanceEditor", import.meta.env.DEV ? "DEBUG" : "ERROR"),
    [],
  );

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<AttendanceEditInputs>({
    mode: "onChange",
    defaultValues,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(attendanceEditSchema) as any,
  });

  const {
    fields: restFields,
    remove: restRemove,
    append: restAppend,
    replace: restReplace,
    update: restUpdate,
  } = useFieldArray({
    control,
    name: "rests",
  });

  const {
    fields: systemCommentFields,
    update: systemCommentUpdate,
    replace: systemCommentReplace,
  } = useFieldArray({
    control,
    name: "systemComments",
  });

  const {
    fields: hourlyPaidHolidayTimeFields,
    remove: hourlyPaidHolidayTimeRemove,
    append: hourlyPaidHolidayTimeAppend,
    update: hourlyPaidHolidayTimeUpdate,
    replace: hourlyPaidHolidayTimeReplace,
  } = useFieldArray({
    control,
    name: "hourlyPaidHolidayTimes",
  });

  const {
    attendance,
    staff,
    workDate,
    historiesLoading,
    sortedHistories,
    historyIndex,
    setHistoryIndex,
    applyHistory,
    refetchAttendance,
    hasAttendanceFetched,
  } = useAttendanceRecord({
    targetStaffId,
    targetWorkDate,
    readOnly,
    setValue,
    reset,
    restReplace,
    hourlyPaidHolidayTimeReplace,
    systemCommentReplace,
    getValues,
    logger,
  });

  // 残業申請情報を取得
  const { overtimeRequestEndTime, hasOvertimeRequest } = useOvertimeRequest({
    staffId: staff?.id ?? targetStaffId ?? null,
    workDate: workDate ? workDate.format("YYYY-MM-DD") : null,
    isAuthenticated,
  });


  // eslint-disable-next-line react-hooks/rules-of-hooks
  const watchedData = watch();
  const errorMessages = useMemo(
    () => collectAttendanceErrorMessages(errors),
    [errors],
  );

  // 残業チェック：業務終了時間を超過した場合の検証
  useEffect(() => {
    if (!watchedData.endTime || !appConfig) {
      setOvertimeError(null);
      return;
    }

    const workEndTimeStr = getEndTime().format("HH:mm");
    const context: OvertimeCheckContext = {
      workEndTime: workEndTimeStr,
      overTimeCheckEnabled: appConfig.overTimeCheckEnabled ?? false,
      overtimeRequestEndTime,
      hasOvertimeRequest,
    };

    const result = validateOvertimeCheck(watchedData.endTime, context);
    if (!result.isValid && result.errorMessage) {
      setOvertimeError(result.errorMessage);
    } else {
      setOvertimeError(null);
    }
  }, [
    watchedData.endTime,
    appConfig,
    overtimeRequestEndTime,
    hasOvertimeRequest,
    getEndTime,
  ]);

  const totalWorkTime = useMemo(() => {
    if (!watchedData.endTime) return 0;
    return calcTotalWorkTime(watchedData.startTime, watchedData.endTime);
  }, [watchedData.startTime, watchedData.endTime]);

  const totalRestTime = useMemo(
    () =>
      watchedData.rests?.reduce((acc, rest) => {
        if (!rest) return acc;
        if (!rest.endTime) return acc;

        const diff = calcTotalRestTime(rest.startTime, rest.endTime);
        return acc + diff;
      }, 0) ?? 0,
    [watchedData.rests],
  );

  const totalProductionTime = useMemo(
    () => totalWorkTime - totalRestTime,
    [totalWorkTime, totalRestTime],
  );

  // 合計時間単位休暇時間を計算
  const totalHourlyPaidHolidayTime = useMemo(
    () =>
      watchedData.hourlyPaidHolidayTimes?.reduce((acc, time) => {
        if (!time) return acc;
        if (!time.endTime) return acc;

        const diff = calcTotalHourlyPaidHolidayTime(
          time.startTime,
          time.endTime,
        );
        return acc + diff;
      }, 0) ?? 0,
    [watchedData.hourlyPaidHolidayTimes],
  );


  // 休憩中かどうかを判定（勤務開始時間と最初の休憩時間が入力されている状態）
  const isOnBreak = useMemo(
    () =>
      !!(
        watchedData.startTime &&
        watchedData.rests &&
        watchedData.rests.length > 0 &&
        watchedData.rests[0]?.startTime &&
        !watchedData.rests[0]?.endTime
      ),
    [watchedData.startTime, watchedData.rests],
  );

  const onSubmit = useCallback(
    async (data: AttendanceEditInputs) => {
      // 残業チェック：バリデーションエラーがある場合は提出を中止
      if (overtimeError) {
        dispatch(setSnackbarError(overtimeError));
        return;
      }

      // 備考はユーザー入力の値（data.remarks）をそのまま保存します。
      // 画面上に表示しているタグ（remarkTags）は見かけ上の表示であり、備考の値には影響を与えません。
      if (attendance) {
        // 有給フラグが付いている場合は勤務時間/休憩等は送らない（バックエンド側バリデーション対策）
        const payload = {
          id: attendance.id,
          staffId: attendance.staffId,
          workDate: data.workDate,
          // 有給の場合は規定開始/終了時刻を送る
          startTime: data.paidHolidayFlag
            ? resolveConfigTimeOnDate(
                getStartTime(),
                data.workDate as string | null | undefined,
                attendance?.workDate,
                targetWorkDate,
              )
            : data.startTime,
          endTime: data.paidHolidayFlag
            ? resolveConfigTimeOnDate(
                getEndTime(),
                data.workDate as string | null | undefined,
                attendance?.workDate,
                targetWorkDate,
              )
            : data.endTime || null,
          absentFlag: data.absentFlag ?? false,
          isDeemedHoliday: data.isDeemedHoliday,
          goDirectlyFlag: data.goDirectlyFlag,
          returnDirectlyFlag: data.returnDirectlyFlag,
          remarks: data.remarks,
          revision: data.revision,
          paidHolidayFlag: data.paidHolidayFlag,
          specialHolidayFlag: data.specialHolidayFlag,
          substituteHolidayDate: data.substituteHolidayDate,
          // 有給の場合は規定の昼休憩時間を送信する（勤務時間は規定値）
          rests: data.paidHolidayFlag
            ? [
                {
                  startTime: new AttendanceDateTime()
                    .setDateString(
                      (data.workDate as string) || attendance?.workDate || "",
                    )
                    .setRestStart()
                    .toISOString(),
                  endTime: new AttendanceDateTime()
                    .setDateString(
                      (data.workDate as string) || attendance?.workDate || "",
                    )
                    .setRestEnd()
                    .toISOString(),
                },
              ]
            : (data.rests || []).map((rest) => ({
                startTime: rest.startTime,
                endTime: rest.endTime,
              })),
          systemComments: (data.systemComments || []).map(
            ({ comment, confirmed, createdAt }) => ({
              comment,
              confirmed,
              createdAt,
            }),
          ),
          hourlyPaidHolidayTimes: data.paidHolidayFlag
            ? []
            : buildHourlyPaidHolidayTimes(data.hourlyPaidHolidayTimes),
          logContext: {
            action: "attendance.update",
          },
        };

        try {
          const res = await handleUpdateAttendance(payload);

          // 管理者が他のスタッフの勤怠を編集した場合のみメール送信
          try {
            const isEditingOtherStaff =
              staff &&
              authenticatedUser &&
              staff.cognitoUserId !== authenticatedUser.cognitoUserId;

            if (isEditingOtherStaff && res && enabledSendMail) {
              await new AttendanceEditMailSender(staff, res).changeRequest();
            }
          } catch (mailError) {
            // メール送信に失敗しても更新処理自体は成功扱いにする
            logger.error(`Failed to send edit mail: ${mailError}`);
          }

          // 更新後は最新の勤怠を再取得してフォームを最新化する
          if (staff && targetWorkDate) {
            await refetchAttendance();
          }

          dispatch(setSnackbarSuccess(MESSAGE_CODE.S04001));
        } catch (error) {
          logger.error(`Update attendance error:`, error);
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          logger.error(`Error details: ${errorMessage}`);
          dispatch(setSnackbarError(MESSAGE_CODE.E04001));
        }

        return;
      }

      if (!targetStaffId || !targetWorkDate) {
        dispatch(setSnackbarError(MESSAGE_CODE.E04001));
        return;
      }

      try {
        const res = await handleCreateAttendance({
          // 有給の場合は勤務時間/休憩などのフィールドをクリアして送信
          staffId: targetStaffId,
          workDate: new AttendanceDateTime()
            .setDateString(targetWorkDate)
            .toDataFormat(),
          // 有給の場合は規定開始/終了時刻のみ送る
          startTime: data.paidHolidayFlag
            ? resolveConfigTimeOnDate(
                getStartTime(),
                data.workDate as string | null | undefined,
                targetWorkDate,
              )
            : data.startTime,
          absentFlag: data.absentFlag ?? false,
          isDeemedHoliday: data.isDeemedHoliday,
          endTime: data.paidHolidayFlag
            ? resolveConfigTimeOnDate(
                getEndTime(),
                data.workDate as string | null | undefined,
                targetWorkDate,
              )
            : data.endTime,
          goDirectlyFlag: data.goDirectlyFlag,
          returnDirectlyFlag: data.returnDirectlyFlag,
          remarks: data.remarks,
          specialHolidayFlag: data.specialHolidayFlag,
          paidHolidayFlag: data.paidHolidayFlag,
          substituteHolidayDate: data.substituteHolidayDate,
          rests: data.paidHolidayFlag
            ? [
                {
                  startTime: new AttendanceDateTime()
                    .setDateString((targetWorkDate as string) || "")
                    .setRestStart()
                    .toISOString(),
                  endTime: new AttendanceDateTime()
                    .setDateString((targetWorkDate as string) || "")
                    .setRestEnd()
                    .toISOString(),
                },
              ]
            : (data.rests || []).map((rest) => ({
                startTime: rest.startTime,
                endTime: rest.endTime,
              })),
          systemComments: (data.systemComments || []).map(
            ({ comment, confirmed, createdAt }) => ({
              comment,
              confirmed,
              createdAt,
            }),
          ),
          hourlyPaidHolidayTimes: data.paidHolidayFlag
            ? []
            : buildHourlyPaidHolidayTimes(data.hourlyPaidHolidayTimes),
          logContext: {
            action: "attendance.create",
          },
        });

        if (!staff) {
          return;
        }

        // 管理者が他のスタッフの勤怠を作成した場合のみメール送信
        if (enabledSendMail) {
          try {
            const isEditingOtherStaff =
              authenticatedUser &&
              staff.cognitoUserId !== authenticatedUser.cognitoUserId;

            if (isEditingOtherStaff) {
              await new AttendanceEditMailSender(staff, res).changeRequest();
            }
          } catch (mailError) {
            // メール送信に失敗しても作成処理自体は成功扱いにする
            logger.error(`Failed to send create mail: ${mailError}`);
          }
        }

        dispatch(setSnackbarSuccess(MESSAGE_CODE.S04001));
      } catch (error) {
        logger.error(`Create attendance error:`, error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`Error details: ${errorMessage}`);
        dispatch(setSnackbarError(MESSAGE_CODE.E04001));
      }
    },
    [
      attendance,
      staff,
      enabledSendMail,
      handleUpdateAttendance,
      handleCreateAttendance,
      targetStaffId,
      targetWorkDate,
      dispatch,
      refetchAttendance,
      getStartTime,
      getEndTime,
      overtimeError,
    ],
  );

  // absentFlag の変更に応じて備考欄を自動更新する
  const absentFlagValue = useWatch({ control, name: "absentFlag" });

  useEffect(() => {
    const flag = !!absentFlagValue;
    const tags: string[] = (getValues("remarkTags") as string[]) || [];
    const has = tags.includes("欠勤");
    if (flag && !has) {
      setValue("remarkTags", [...tags, "欠勤"]);
    }
    if (!flag && has) {
      setValue(
        "remarkTags",
        tags.filter((t) => t !== "欠勤"),
      );
    }
  }, [absentFlagValue, setValue, getValues]);

  // specialHolidayFlag の変更に応じて備考欄へ "特別休暇" を追記/削除し、
  // ON の場合は有給と同様に規定の開始/終了時刻と休憩を設定する
  const specialHolidayFlagValue = useWatch({
    control,
    name: "specialHolidayFlag",
  });

  useEffect(() => {
    const flag = !!specialHolidayFlagValue;

    if (flag) {
      // 備考タグに特別休暇が無ければ追記
      const tags: string[] = (getValues("remarkTags") as string[]) || [];
      if (!tags.includes("特別休暇")) {
        setValue("remarkTags", [...tags, "特別休暇"]);
      }

      // 開始/終了時刻を規定値に設定（既に同じであれば何もしない）
      try {
        const desiredStart = resolveConfigTimeOnDate(
          getStartTime(),
          getValues("startTime") as string | null | undefined,
          targetWorkDate,
          attendance?.workDate,
          workDate,
        );
        const desiredEnd = resolveConfigTimeOnDate(
          getEndTime(),
          getValues("endTime") as string | null | undefined,
          targetWorkDate,
          attendance?.workDate,
          workDate,
        );
        if (getValues("startTime") !== desiredStart) {
          setValue("startTime", desiredStart);
        }
        if (getValues("endTime") !== desiredEnd) {
          setValue("endTime", desiredEnd);
        }
      } catch (e) {
        logger.debug(`failed to set default times for special holiday: ${e}`);
      }

      // 休憩を規定値に設定（既に同じ配列でなければ置換）
      const dateStr =
        (getValues("workDate") as string) || attendance?.workDate || "";
      const lunchStartCfg = getLunchRestStartTime();
      const lunchEndCfg = getLunchRestEndTime();
      const baseDay = dateStr ? dayjs(dateStr) : workDate ? workDate : dayjs();
      const desiredRests: RestInputs[] = [
        {
          startTime: baseDay
            .hour(lunchStartCfg.hour())
            .minute(lunchStartCfg.minute())
            .second(0)
            .millisecond(0)
            .toISOString(),
          endTime: baseDay
            .hour(lunchEndCfg.hour())
            .minute(lunchEndCfg.minute())
            .second(0)
            .millisecond(0)
            .toISOString(),
        },
      ];
      try {
        const currentRests = getValues("rests") || [];
        if (JSON.stringify(currentRests) !== JSON.stringify(desiredRests)) {
          if (restReplace && typeof restReplace === "function") {
            restReplace(desiredRests);
          } else {
            setValue("rests", desiredRests);
          }
        }
      } catch {
        // noop
      }

      // 時間単位休暇はクリア（有給時と同様）
      try {
        const currentHourly = getValues("hourlyPaidHolidayTimes") || [];
        if ((currentHourly as HourlyPaidHolidayTimeInputs[]).length > 0) {
          hourlyPaidHolidayTimeReplace([]);
        }
      } catch {
        // noop
      }

      // 特別休暇がONのとき、有給フラグが立っていたら解除する（相互排他）
      try {
        const currentPaid = getValues("paidHolidayFlag");
        if (currentPaid) {
          setValue("paidHolidayFlag", false);
        }
      } catch {
        // noop
      }
    } else {
      // OFF になったら備考タグから "特別休暇" を削除
      const tags: string[] = (getValues("remarkTags") as string[]) || [];
      if (tags.includes("特別休暇")) {
        setValue(
          "remarkTags",
          tags.filter((t) => t !== "特別休暇"),
        );
      }
    }
  }, [specialHolidayFlagValue]);

  // paidHolidayFlag の変更に応じて備考欄へ "有給休暇" を追記/削除する
  const paidHolidayFlagValue = useWatch({ control, name: "paidHolidayFlag" });

  useEffect(() => {
    const flag = !!paidHolidayFlagValue;
    try {
      const tags: string[] = (getValues("remarkTags") as string[]) || [];
      if (flag) {
        if (!tags.includes("有給休暇")) {
          setValue("remarkTags", [...tags, "有給休暇"]);
        }
      } else {
        if (tags.includes("有給休暇")) {
          setValue(
            "remarkTags",
            tags.filter((t) => t !== "有給休暇"),
          );
        }
      }
    } catch {
      // noop
    }
  }, [paidHolidayFlagValue]);

  if (appConfigLoading || staffsLoading || !hasAttendanceFetched) {
    return <LinearProgress />;
  }

  if (staffSError) {
    return (
      <InlineAlert tone="error" title="エラー">
        {staffSError.message}
      </InlineAlert>
    );
  }

  if (!targetStaffId) {
    return (
      <InlineAlert tone="error" title="エラー">
        スタッフが指定されていません。
      </InlineAlert>
    );
  }

  const changeRequests = attendance?.changeRequests
    ? attendance.changeRequests
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .filter((item) => !item.completed)
    : [];

  return (
    <AttendanceEditProvider
      value={{
        staff,
        workDate,
        attendance,
        onSubmit,
        getValues,
        setValue,
        watch,
        isDirty,
        isValid,
        isSubmitting,
        restFields,
        changeRequests,
        restAppend,
        restRemove,
        restUpdate,
        restReplace,
        register,
        control,
        systemCommentFields,
        systemCommentUpdate,
        systemCommentReplace,
        hourlyPaidHolidayTimeFields,
        hourlyPaidHolidayTimeAppend,
        hourlyPaidHolidayTimeRemove,
        hourlyPaidHolidayTimeUpdate,
        hourlyPaidHolidayTimeReplace,
        hourlyPaidHolidayEnabled: getHourlyPaidHolidayEnabled(),
        errorMessages,
        readOnly,
        isOnBreak,
      }}
    >
      <div className="flex flex-col gap-2 pb-5">
        {isSubmitting && (
          <div className="mt-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full w-1/3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="mt-1 text-center text-sm text-slate-600">
              保存中...
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <AppButton
            onClick={() => {
              if (targetStaffId) {
                navigate(`/admin/staff/${targetStaffId}/attendance`);
                return;
              }
              navigate("/admin/attendances");
            }}
            variant="outline"
            tone="neutral"
            size="sm"
          >
            <span aria-hidden="true" className="text-base leading-none">
              ←
            </span>
            勤怠一覧に戻る
          </AppButton>
          {workDate && (
            <div className="inline-flex w-fit items-center rounded-full bg-slate-900/5 px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-slate-600">
              {workDate.format(AttendanceDate.DisplayFormat)}
            </div>
          )}
        </div>
        <div>
          {readOnly && (
            <div className="mt-1">
              <InlineAlert tone="info">
                <div>この画面は表示専用です（編集はできません）</div>
                {sortedHistories[historyIndex] && (
                  <div className="mt-0.5 text-sm">
                    履歴作成日時:{" "}
                    {dayjs(sortedHistories[historyIndex].createdAt).format(
                      "YYYY/MM/DD HH:mm:ss",
                    )}
                  </div>
                )}
              </InlineAlert>
            </div>
          )}
          {readOnly && (
            <div className="mt-1">
              <AppButton
                onClick={() => {
                  const date = workDate
                    ? workDate.format(AttendanceDate.DataFormat)
                    : targetWorkDate;
                  const sid = targetStaffId;
                  if (date && sid) {
                    navigate(`/admin/attendances/edit/${date}/${sid}`);
                  }
                }}
                variant="outline"
                tone="neutral"
                size="sm"
              >
                編集画面に戻る
              </AppButton>
            </div>
          )}
        </div>

        {/* 履歴一覧とフォームを左右に並べる（表示専用モード） */}
        <div className={readOnly ? "mt-1 flex items-start gap-2" : undefined}>
          {/* 左: 履歴リスト（表示専用時） */}
          {readOnly && (
            <div className="pointer-events-auto z-[1500] max-h-[60vh] w-[260px] overflow-y-auto">
              {historiesLoading ? (
                <div className="p-2">
                  <LinearProgress />
                </div>
              ) : sortedHistories && sortedHistories.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {sortedHistories.map((h, idx) => (
                    <AppButton
                      key={idx}
                      onClick={() => {
                        setHistoryIndex(idx);
                        try {
                          applyHistory(idx);
                        } catch {
                          // noop
                        }
                      }}
                      variant={idx === historyIndex ? "solid" : "outline"}
                      tone={idx === historyIndex ? "primary" : "neutral"}
                      size="sm"
                      fullWidth
                      className="flex-col items-start"
                    >
                      <span className="text-sm font-semibold text-slate-900">
                        {`履歴 #${sortedHistories.length - idx}`}
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        {dayjs(h.createdAt).format("YYYY/MM/DD HH:mm:ss")}
                      </span>
                    </AppButton>
                  ))}
                </div>
              ) : (
                <div className="p-2">
                  <InlineAlert tone="info">履歴がありません。</InlineAlert>
                </div>
              )}
            </div>
          )}

          {/* 右: フォーム（常に表示） */}
          <div className="grow">
            <div className="flex flex-col gap-2 px-[120px]">
              {errorMessages.length > 0 && (
                <AttendanceErrorSummary messages={errorMessages} />
              )}

              {overtimeError && (
                <div>
                  <InlineAlert tone="error" title="残業チェック">
                    {overtimeError}
                  </InlineAlert>
                </div>
              )}

              {!attendance && (
                <div>
                  <InlineAlert tone="info">
                    指定された日付に勤怠情報の登録がありません。保存時に新規作成されます。
                  </InlineAlert>
                </div>
              )}

              <div className="flex gap-1">
                {!readOnly && <EditAttendanceHistoryList />}
                {!readOnly && <SystemCommentList />}
              </div>

              {!readOnly && (
                <GroupContainer hideAccent hideBorder>
                  <QuickInputButtons
                    setValue={setValue}
                    restReplace={restReplace}
                    hourlyPaidHolidayTimeReplace={hourlyPaidHolidayTimeReplace}
                    workDate={workDate}
                    visibleMode="admin"
                    getValues={getValues}
                    readOnly={readOnly}
                  />
                </GroupContainer>
              )}

              <GroupContainer hideAccent hideBorder>
                <div>
                  <WorkDateItem
                    staffId={targetStaffId}
                    workDate={workDate}
                    MoveDateItemComponent={MoveDateItem}
                  />
                </div>
              </GroupContainer>

              <AttendanceEditFormSkeleton
                control={control}
                highlightStartTime={highlightStartTime}
                highlightEndTime={highlightEndTime}
                onHighlightEndTime={setHighlightEndTime}
                totalProductionTime={totalProductionTime}
                totalHourlyPaidHolidayTime={totalHourlyPaidHolidayTime}
                readOnly={readOnly}
                changeRequests={changeRequests}
                onGoDirectlyChange={(checked) => {
                  if (checked) {
                    setValue(
                      "startTime",
                      resolveConfigTimeOnDate(
                        getStartTime(),
                        getValues("startTime") as string | null | undefined,
                        workDate,
                        targetWorkDate,
                      ),
                    );
                    setHighlightStartTime(true);
                    setTimeout(() => setHighlightStartTime(false), 2500);
                  }
                }}
                vacationTabsContent={(() => {
                  const items: { label: string; content: JSX.Element }[] = [];
                  items.push({
                    label: "振替休日",
                    content: <SubstituteHolidayDateInput />,
                  });
                  items.push({
                    label: "有給(1日)",
                    content: (
                      <PaidHolidayFlagInputCommon
                        label="有給休暇(1日)"
                        control={control}
                        setValue={setValue}
                        workDate={workDate ? workDate.toISOString() : undefined}
                        setPaidHolidayTimes={true}
                        disabled={changeRequests.length > 0 || !!readOnly}
                        restReplace={restReplace}
                        getValues={getValues}
                      />
                    ),
                  });
                  if (getAbsentEnabled && getAbsentEnabled()) {
                    items.push({
                      label: "欠勤",
                      content: (
                        <div className="mt-1">
                          <div className="flex items-center">
                            <div className="w-[150px] font-bold">
                              欠勤
                            </div>
                            <div>
                              <Controller
                                name="absentFlag"
                                control={control}
                                render={({ field }) => (
                                  <Checkbox
                                    {...field}
                                    checked={field.value || false}
                                    disabled={
                                      changeRequests.length > 0 || !!readOnly
                                    }
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    });
                  }
                  if (getSpecialHolidayEnabled && getSpecialHolidayEnabled()) {
                    items.push({
                      label: "特別休暇",
                      content: (
                        <div className="mt-1">
                          <div className="flex items-center">
                            <div className="w-[150px] font-bold">
                              特別休暇
                            </div>
                            <div>
                              <Controller
                                name="specialHolidayFlag"
                                control={control}
                                render={({ field }) => (
                                  <Checkbox
                                    {...field}
                                    checked={field.value || false}
                                    disabled={
                                      changeRequests.length > 0 || !!readOnly
                                    }
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    });
                  }
                  if (getHourlyPaidHolidayEnabled()) {
                    items.push({
                      label: `時間単位(${hourlyPaidHolidayTimeFields.length}件)`,
                      content: (
                        <div className="flex flex-col gap-1">
                          <div className="flex">
                            <div className="w-[150px] font-bold">{`時間単位休暇(${hourlyPaidHolidayTimeFields.length}件)`}</div>
                            <div className="flex grow flex-col gap-1">
                              {hourlyPaidHolidayTimeFields.length === 0 && (
                                <div className="text-sm text-slate-500">
                                  時間単位休暇の時間帯を追加してください。
                                </div>
                              )}
                              {hourlyPaidHolidayTimeFields.map(
                                (hourlyPaidHolidayTime, index) => (
                                  <HourlyPaidHolidayTimeItem
                                    key={hourlyPaidHolidayTime.id}
                                    time={hourlyPaidHolidayTime}
                                    index={index}
                                  />
                                ),
                              )}
                              <div>
                                <AppIconButton
                                  aria-label="add-hourly-paid-holiday-time"
                                  onClick={() =>
                                    hourlyPaidHolidayTimeAppend({
                                      startTime: null,
                                      endTime: null,
                                    })
                                  }
                                  disabled={!!readOnly}
                                  tone="primary"
                                >
                                  <AddAlarmIcon />
                                </AppIconButton>
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    });
                  }
                  items.push({
                    label: "指定休日",
                    content: (
                      <div className="mt-1">
                        <IsDeemedHolidayFlagInput
                          control={control}
                          name="isDeemedHoliday"
                          disabled={
                            !(staff?.workType === "shift") || !!readOnly
                          }
                          helperText={
                            staff?.workType === "shift"
                              ? undefined
                              : "※シフト勤務のスタッフのみ設定できます"
                          }
                        />
                      </div>
                    ),
                  });

                  return (
                    <VacationTabs
                      value={vacationTab}
                      onChange={setVacationTab}
                      items={items}
                      panelPadding={2}
                      tabsProps={{
                        "aria-label": "vacation-tabs",
                        sx: { borderBottom: 1, borderColor: "divider" },
                      }}
                    />
                  );
                })()}
                remarksContent={<RemarksItem />}
                additionalBottomContent={
                  !readOnly ? (
                    <GroupContainer hideAccent hideBorder>
                      {attendance?.updatedAt && (
                        <div className="flex items-center">
                          <div className="w-[150px] font-bold">
                            最終更新日時
                          </div>
                          <div className="grow">
                            <div className="pl-1 text-base text-slate-500">
                              {dayjs(attendance.updatedAt).format(
                                "YYYY/MM/DD HH:mm:ss",
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center">
                          <div className="w-[150px] font-bold">
                            メール設定
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={enabledSendMail}
                              onChange={() =>
                                setEnabledSendMail((prev) => !prev)
                              }
                              className="h-4 w-4 accent-emerald-600"
                            />
                            <span>スタッフに変更通知メールを送信する</span>
                          </div>
                        </div>
                      </div>
                    </GroupContainer>
                  ) : undefined
                }
              />

              <div className="flex items-center justify-center gap-3">
                <div>
                  {!readOnly && (
                    <AppButton
                      onClick={handleSubmit(onSubmit)}
                      disabled={
                        !isValid || !isDirty || isSubmitting || !!overtimeError
                      }
                      loading={isSubmitting}
                      size="lg"
                    >
                      {isSubmitting ? "保存中..." : "保存"}
                    </AppButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <ChangeRequestDialog
          attendance={attendance}
          updateAttendance={handleUpdateAttendance}
          staff={staff}
        />
        {/* readOnly mode: don't overlay the whole page. Inputs/components
            should rely on their own `disabled`/`readOnly` props so the UI
            remains visible but non-editable where appropriate. */}
      </div>
    </AttendanceEditProvider>
  );
}
