import AddAlarmIcon from "@mui/icons-material/AddAlarm";
import {
  Alert,
  AlertTitle,
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  styled,
  Switch,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Logger } from "aws-amplify";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import { AttendanceHistory, SystemCommentInput } from "@/API";
import { GoDirectlyFlagCheckbox } from "@/components/attendance_editor/GoDirectlyFlagCheckbox";
import IsDeemedHolidayFlagInput from "@/components/attendance_editor/IsDeemedHolidayFlagInput";
import PaidHolidayFlagInputCommon from "@/components/attendance_editor/PaidHolidayFlagInput";
import ReturnDirectlyFlagInput from "@/components/attendance_editor/ReturnDirectlyFlagInput";
import useAppConfig from "@/hooks/useAppConfig/useAppConfig";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { AttendanceDateTime } from "@/lib/AttendanceDateTime";
import { AttendanceEditMailSender } from "@/lib/mail/AttendanceEditMailSender";
import AttendanceEditProvider from "@/pages/AttendanceEdit/AttendanceEditProvider";
import {
  AttendanceEditInputs,
  defaultValues,
  HourlyPaidHolidayTimeInputs,
  RestInputs,
} from "@/pages/AttendanceEdit/common";
import { SubstituteHolidayDateInput } from "@/pages/AttendanceEdit/DesktopEditor/SubstituteHolidayDateInput";

import { useAppDispatchV2 } from "../../app/hooks";
import * as MESSAGE_CODE from "../../errors";
import useAttendance from "../../hooks/useAttendance/useAttendance";
import useStaffs, {
  mappingStaffRole,
  StaffType,
} from "../../hooks/useStaffs/useStaffs";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../lib/reducers/snackbarReducer";
import MoveDateItem from "../attendance_editor/MoveDateItem";
import Title from "../Title/Title";
import GroupContainer from "../ui/GroupContainer/GroupContainer";
import ChangeRequestDialog from "./ChangeRequestDialog/ChangeRequestDialog";
// eslint-disable-next-line import/no-cycle
import EditAttendanceHistoryList from "./EditAttendanceHistoryList/EditAttendanceHistoryList";
import HourlyPaidHolidayTimeItem, {
  calcTotalHourlyPaidHolidayTime,
} from "./items/HourlyPaidHolidayTimeItem";
import ProductionTimeItem from "./items/ProductionTimeItem";
// eslint-disable-next-line import/no-cycle
import RemarksItem from "./items/RemarksItem";
// eslint-disable-next-line import/no-cycle
import {
  calcTotalRestTime,
  RestTimeItem,
} from "./items/RestTimeItem/RestTimeItem";
import SeparatorItem from "./items/SeparatorItem";
import StaffNameItem from "./items/StaffNameItem";
import WorkDateItem from "./items/WorkDateItem";
import {
  calcTotalWorkTime,
  WorkTimeItem,
} from "./items/WorkTimeItem/WorkTimeItem";
import WorkTypeItem from "./items/WorkTypeItem";
import { LunchRestTimeNotSetWarning } from "./LunchRestTimeNotSetWarning";
import QuickInputButtons from "./QuickInputButtons";
import { SystemCommentList } from "./SystemCommentList";

const SaveButton = styled(Button)(({ theme }) => ({
  width: 150,
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  border: `3px solid ${theme.palette.primary.main}`,
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.contrastText,
    border: `3px solid ${theme.palette.primary.light}`,
  },
  "&:disabled": {
    backgroundColor: "#E0E0E0",
    border: "3px solid #E0E0E0",
  },
}));

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
  } = useAppConfig();
  const dispatch = useAppDispatchV2();

  const { targetWorkDate, staffId: targetStaffId } = useParams();
  const navigate = useNavigate();
  const { staffs, loading: staffsLoading, error: staffSError } = useStaffs();
  const { attendance, getAttendance, updateAttendance, createAttendance } =
    useAttendance();
  const [staff, setStaff] = useState<StaffType | undefined | null>(undefined);
  const [workDate, setWorkDate] = useState<dayjs.Dayjs | null>(null);
  const [enabledSendMail, setEnabledSendMail] = useState<boolean>(true);
  const [vacationTab, setVacationTab] = useState<number>(0);

  const logger = new Logger(
    "AttendanceEditor",
    import.meta.env.DEV ? "DEBUG" : "ERROR"
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

  // histories (sorted newest first) and navigation state
  const sortedHistories = useMemo<AttendanceHistory[]>(() => {
    if (!attendance?.histories) return [];
    return attendance.histories
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) =>
        dayjs(b.createdAt).isBefore(dayjs(a.createdAt)) ? -1 : 1
      ) as AttendanceHistory[];
  }, [attendance?.histories]);

  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [historiesLoading, setHistoriesLoading] = useState<boolean>(false);

  // apply selected history to the form
  const applyHistory = useCallback(
    (index: number) => {
      if (!sortedHistories || !sortedHistories[index]) return;
      const h = sortedHistories[index];

      logger.debug(
        `applyHistory called index=${index}, createdAt=${h?.createdAt}`
      );

      try {
        // set simple fields
        setValue("startTime", h.startTime ?? "");
        setValue("endTime", h.endTime ?? "");
        setValue("goDirectlyFlag", h.goDirectlyFlag ?? false);
        setValue("returnDirectlyFlag", h.returnDirectlyFlag ?? false);
        setValue("paidHolidayFlag", h.paidHolidayFlag ?? false);
        setValue("specialHolidayFlag", h.specialHolidayFlag ?? false);
        setValue("remarks", h.remarks ?? "");
        setValue("substituteHolidayDate", h.substituteHolidayDate ?? undefined);

        // rests
        const rests: RestInputs[] = h.rests
          ? h.rests
              .filter((r): r is NonNullable<typeof r> => r !== null)
              .map((r) => ({
                startTime: r.startTime ?? null,
                endTime: r.endTime ?? null,
              }))
          : [];
        restReplace(rests);

        // hourly paid holiday times
        const hourly: HourlyPaidHolidayTimeInputs[] = h.hourlyPaidHolidayTimes
          ? h.hourlyPaidHolidayTimes
              .filter((r): r is NonNullable<typeof r> => r !== null)
              .map((r) => ({
                startTime: r.startTime ?? null,
                endTime: r.endTime ?? null,
              }))
          : [];
        hourlyPaidHolidayTimeReplace(hourly);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to apply history to form:", e);
      }
    },
    [sortedHistories, setValue, restReplace, hourlyPaidHolidayTimeReplace]
  );

  // reset history index when histories change
  useEffect(() => {
    if (!sortedHistories || sortedHistories.length === 0) return;
    setHistoryIndex(0);
  }, [sortedHistories.length]);

  useEffect(() => {
    if (!sortedHistories || sortedHistories.length === 0) return;
    applyHistory(historyIndex);
  }, [historyIndex, sortedHistories, applyHistory]);

  // When opened in readOnly (履歴表示) mode, ensure the latest history is applied
  // immediately even if historyIndex is already 0 (state may not change).
  useEffect(() => {
    if (!readOnly) return;
    if (!sortedHistories || sortedHistories.length === 0) return;
    try {
      // apply latest (index 0) and ensure index reflects it
      applyHistory(0);
      setHistoryIndex(0);
    } catch (e) {
      // noop
    }
  }, [readOnly, sortedHistories.length, applyHistory]);

  // If attendance is fetched after mount, some effects may overwrite form values.
  // Ensure that once attendance is available and we're in readOnly, we re-apply
  // the latest history asynchronously so it wins over other setValue calls.
  useEffect(() => {
    if (!readOnly) return;
    if (!attendance) return;
    if (!sortedHistories || sortedHistories.length === 0) return;

    // schedule after current tick so other attendance->setValue effects run first
    const id = window.setTimeout(() => {
      try {
        logger.debug(`re-applying latest history after attendance load`);
        applyHistory(0);
        setHistoryIndex(0);
      } catch (e) {
        // noop
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [attendance, readOnly, sortedHistories.length, applyHistory]);

  useEffect(() => {
    if (!targetStaffId) return;

    fetchStaff(targetStaffId)
      .then((res) =>
        setStaff({
          id: res.id,
          cognitoUserId: res.cognitoUserId,
          familyName: res.familyName,
          givenName: res.givenName,
          mailAddress: res.mailAddress,
          owner: res.owner ?? false,
          role: mappingStaffRole(res.role),
          enabled: res.enabled,
          status: res.status,
          createdAt: res.createdAt,
          updatedAt: res.updatedAt,
          usageStartDate: res.usageStartDate,
          notifications: res.notifications,
          workType: res.workType,
        })
      )
      .catch((e) => {
        logger.error(
          `Failed to fetch staff with ID ${targetStaffId}: ${e.message}`
        );
        dispatch(setSnackbarError(MESSAGE_CODE.E02001));
      });
  }, [staffs, targetStaffId]);

  useEffect(() => {
    if (!staff || !targetStaffId || !targetWorkDate) return;

    reset();

    setWorkDate(AttendanceDateTime.convertToDayjs(targetWorkDate));
    setHistoriesLoading(true);
    getAttendance(
      staff.cognitoUserId,
      new AttendanceDateTime().setDateString(targetWorkDate).toDataFormat()
    )
      .then(() => {
        // no-op
      })
      .catch((e: Error) => {
        logger.debug(e);
        dispatch(setSnackbarError(MESSAGE_CODE.E02001));
      })
      .finally(() => setHistoriesLoading(false));
  }, [staff, targetStaffId, targetWorkDate]);

  const lunchRestStartTime = useMemo(
    () => getLunchRestStartTime().format("HH:mm"),
    [getLunchRestStartTime]
  );
  const lunchRestEndTime = useMemo(
    () => getLunchRestEndTime().format("HH:mm"),
    [getLunchRestEndTime]
  );

  const watchedData = watch();

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
    [watchedData.rests]
  );

  const totalProductionTime = useMemo(
    () => totalWorkTime - totalRestTime,
    [totalWorkTime, totalRestTime]
  );

  // 合計時間単位休暇時間を計算
  const totalHourlyPaidHolidayTime = useMemo(
    () =>
      watchedData.hourlyPaidHolidayTimes?.reduce((acc, time) => {
        if (!time) return acc;
        if (!time.endTime) return acc;

        const diff = calcTotalHourlyPaidHolidayTime(
          time.startTime,
          time.endTime
        );
        return acc + diff;
      }, 0) ?? 0,
    [watchedData.hourlyPaidHolidayTimes]
  );

  const visibleRestWarning = useMemo(
    () =>
      !!(
        watchedData.startTime &&
        watchedData.endTime &&
        totalWorkTime > 6 &&
        totalRestTime === 0
      ),
    [watchedData.startTime, watchedData.endTime, totalWorkTime, totalRestTime]
  );

  const onSubmit = useCallback(
    async (data: AttendanceEditInputs) => {
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
            ? getStartTime().toISOString()
            : data.startTime,
          endTime: data.paidHolidayFlag
            ? getEndTime().toISOString()
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
                      (data.workDate as string) || attendance?.workDate || ""
                    )
                    .setRestStart()
                    .toISOString(),
                  endTime: new AttendanceDateTime()
                    .setDateString(
                      (data.workDate as string) || attendance?.workDate || ""
                    )
                    .setRestEnd()
                    .toISOString(),
                },
              ]
            : data.rests.map((rest) => ({
                startTime: rest.startTime,
                endTime: rest.endTime,
              })),
          systemComments: data.systemComments.map(
            ({ comment, confirmed, createdAt }) => ({
              comment,
              confirmed,
              createdAt,
            })
          ),
          hourlyPaidHolidayTimes: data.paidHolidayFlag
            ? []
            : (data.hourlyPaidHolidayTimes
                ?.map((item) =>
                  item.startTime && item.endTime
                    ? {
                        startTime: item.startTime,
                        endTime: item.endTime,
                      }
                    : null
                )
                .filter((item) => item !== null) as {
                startTime: string;
                endTime: string;
              }[]) ?? [],
        };

        await updateAttendance(payload)
          .then(async (res) => {
            // 成功時は可能ならメール送信
            try {
              if (staff && res && res.histories && enabledSendMail) {
                new AttendanceEditMailSender(staff, res).changeRequest();
              }
            } catch (e) {
              // メール送信に失敗しても更新処理自体は成功扱いにする
              logger.error(`Failed to send edit mail: ${e}`);
            }

            // 更新後は最新の勤怠を再取得してフォームを最新化する
            try {
              if (staff && targetWorkDate) {
                await getAttendance(
                  staff.cognitoUserId,
                  new AttendanceDateTime()
                    .setDateString(targetWorkDate)
                    .toDataFormat()
                );
              }
            } catch (e) {
              logger.debug(`Failed to refetch attendance after update: ${e}`);
            }

            dispatch(setSnackbarSuccess(MESSAGE_CODE.S04001));
          })
          .catch((e) => {
            console.log(e);
            dispatch(setSnackbarError(MESSAGE_CODE.E04001));
          });

        return;
      }

      if (!targetStaffId || !targetWorkDate) {
        dispatch(setSnackbarError(MESSAGE_CODE.E04001));
        return;
      }

      await createAttendance({
        // 有給の場合は勤務時間/休憩などのフィールドをクリアして送信
        staffId: targetStaffId,
        workDate: new AttendanceDateTime()
          .setDateString(targetWorkDate)
          .toDataFormat(),
        // 有給の場合は規定開始/終了時刻のみ送る
        startTime: data.paidHolidayFlag
          ? getStartTime().toISOString()
          : data.startTime,
        absentFlag: data.absentFlag ?? false,
        isDeemedHoliday: data.isDeemedHoliday,
        endTime: data.paidHolidayFlag
          ? getEndTime().toISOString()
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
          : data.rests.map((rest) => ({
              startTime: rest.startTime,
              endTime: rest.endTime,
            })),
        systemComments: data.systemComments.map(
          ({ comment, confirmed, createdAt }) => ({
            comment,
            confirmed,
            createdAt,
          })
        ),
        hourlyPaidHolidayTimes: data.paidHolidayFlag
          ? []
          : (data.hourlyPaidHolidayTimes
              ?.map((item) =>
                item.startTime && item.endTime
                  ? {
                      startTime: item.startTime,
                      endTime: item.endTime,
                    }
                  : null
              )
              .filter((item) => item !== null) as {
              startTime: string;
              endTime: string;
            }[]) ?? [],
      })
        .then((res) => {
          if (!staff) {
            return;
          }

          if (enabledSendMail) {
            new AttendanceEditMailSender(staff, res).changeRequest();
          }

          dispatch(setSnackbarSuccess(MESSAGE_CODE.S04001));
        })
        .catch(() => {
          dispatch(setSnackbarError(MESSAGE_CODE.E04001));
        });
    },
    [
      attendance,
      staff,
      enabledSendMail,
      updateAttendance,
      createAttendance,
      targetStaffId,
      targetWorkDate,
      dispatch,
    ]
  );

  useEffect(() => {
    if (!attendance) return;

    setWorkDate(AttendanceDateTime.convertToDayjs(attendance.workDate));

    setValue("workDate", attendance.workDate);
    setValue("startTime", attendance.startTime);
    setValue("isDeemedHoliday", attendance.isDeemedHoliday ?? false);
    setValue("specialHolidayFlag", attendance.specialHolidayFlag ?? false);
    setValue("endTime", attendance.endTime);
    // 備考はそのまま表示する（タグと直接紐付けない）
    setValue("remarks", attendance.remarks || "");
    // remarkTags はフラグから初期化する（有給/特別/欠勤）
    try {
      const initTags: string[] = [];
      if (attendance.paidHolidayFlag) initTags.push("有給休暇");
      if (attendance.specialHolidayFlag) initTags.push("特別休暇");
      if (attendance.absentFlag) initTags.push("欠勤");
      setValue("remarkTags", initTags);
    } catch (e) {
      // noop
    }
    setValue("goDirectlyFlag", attendance.goDirectlyFlag || false);
    setValue("returnDirectlyFlag", attendance.returnDirectlyFlag || false);
    setValue("paidHolidayFlag", attendance.paidHolidayFlag || false);
    setValue("absentFlag", attendance.absentFlag || false);
    setValue("substituteHolidayDate", attendance.substituteHolidayDate);
    setValue("revision", attendance.revision);
    // 追加: 既存のhourlyPaidHolidayTimesがあれば維持、なければ空配列
    setValue(
      "hourlyPaidHolidayTimes",
      getValues("hourlyPaidHolidayTimes") ?? []
    );

    if (attendance.rests) {
      const rests = attendance.rests
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .map((item) => ({
          startTime: item.startTime,
          endTime: item.endTime,
        }));
      restReplace(rests);
    }

    if (attendance.histories) {
      const histories = attendance.histories.filter(
        (item): item is NonNullable<typeof item> => item !== null
      );
      setValue("histories", histories);
    }

    if (attendance.changeRequests) {
      const changeRequests = attendance.changeRequests.filter(
        (item): item is NonNullable<typeof item> => item !== null
      );
      setValue("changeRequests", changeRequests);
    }

    if (attendance.systemComments) {
      const systemComments = attendance.systemComments
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .map(
          ({ comment, confirmed, createdAt }) =>
            ({
              comment,
              confirmed,
              createdAt,
            } as SystemCommentInput)
        );

      systemCommentReplace(systemComments);
    }

    if (attendance.hourlyPaidHolidayTimes) {
      const hourlyPaidHolidayTimes = attendance.hourlyPaidHolidayTimes
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .map((item) => ({
          startTime: item.startTime,
          endTime: item.endTime,
        }));
      hourlyPaidHolidayTimeReplace(hourlyPaidHolidayTimes);
    }
  }, [attendance]);

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
        tags.filter((t) => t !== "欠勤")
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
        const desiredStart = getStartTime().toISOString();
        const desiredEnd = getEndTime().toISOString();
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
      } catch (e) {
        // noop
      }

      // 時間単位休暇はクリア（有給時と同様）
      try {
        const currentHourly = getValues("hourlyPaidHolidayTimes") || [];
        if ((currentHourly as HourlyPaidHolidayTimeInputs[]).length > 0) {
          hourlyPaidHolidayTimeReplace([]);
        }
      } catch (e) {
        // noop
      }

      // 特別休暇がONのとき、有給フラグが立っていたら解除する（相互排他）
      try {
        const currentPaid = getValues("paidHolidayFlag");
        if (currentPaid) {
          setValue("paidHolidayFlag", false);
        }
      } catch (e) {
        // noop
      }
    } else {
      // OFF になったら備考タグから "特別休暇" を削除
      const tags: string[] = (getValues("remarkTags") as string[]) || [];
      if (tags.includes("特別休暇")) {
        setValue(
          "remarkTags",
          tags.filter((t) => t !== "特別休暇")
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
            tags.filter((t) => t !== "有給休暇")
          );
        }
      }
    } catch (e) {
      // noop
    }
  }, [paidHolidayFlagValue]);

  if (appConfigLoading || staffsLoading || attendance === undefined) {
    return <LinearProgress />;
  }

  if (staffSError) {
    return (
      <Alert severity="error">
        <AlertTitle>エラー</AlertTitle>
        <Typography variant="body2">{staffSError.message}</Typography>
      </Alert>
    );
  }

  if (!targetStaffId) {
    return (
      <Alert severity="error">
        <AlertTitle>エラー</AlertTitle>
        <Typography variant="body2">スタッフが指定されていません。</Typography>
      </Alert>
    );
  }

  const changeRequests = attendance?.changeRequests
    ? attendance.changeRequests
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .filter((item) => !item.completed)
    : [];

  function TabPanel({
    children,
    value,
    index,
  }: {
    children: React.ReactNode;
    value: number;
    index: number;
  }) {
    return <>{value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null}</>;
  }

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
        readOnly,
      }}
    >
      <Stack spacing={2} sx={{ pb: 5 }}>
        <Box>
          <Breadcrumbs>
            <Link to="/" color="inherit">
              TOP
            </Link>
            <Link to="/admin/attendances" color="inherit">
              勤怠管理
            </Link>
            <Link
              to={`/admin/staff/${targetStaffId}/attendance`}
              color="inherit"
            >
              勤怠一覧
            </Link>
            {workDate && (
              <Typography color="text.primary">
                {workDate.format(AttendanceDate.DisplayFormat)}
              </Typography>
            )}
          </Breadcrumbs>
        </Box>
        <Box>
          <Title>勤怠編集</Title>
          {readOnly && (
            <Box sx={{ mt: 1 }}>
              <Alert severity="info">
                <div>この画面は表示専用です（編集はできません）</div>
                {sortedHistories[historyIndex] && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    履歴作成日時:{" "}
                    {dayjs(sortedHistories[historyIndex].createdAt).format(
                      "YYYY/MM/DD HH:mm:ss"
                    )}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}
          {/* 戻るボタンをアラート下に移動 */}
          {readOnly && (
            <Box sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  const date = workDate
                    ? workDate.format(AttendanceDate.DataFormat)
                    : targetWorkDate;
                  const sid = targetStaffId;
                  if (date && sid) {
                    navigate(`/admin/attendances/edit/${date}/${sid}`);
                  }
                }}
                sx={{ zIndex: 1500, pointerEvents: "auto" }}
              >
                編集画面に戻る
              </Button>
            </Box>
          )}
        </Box>

        {/* 履歴一覧とフォームを左右に並べる（表示専用モード） */}
        <Box
          sx={
            readOnly
              ? { mt: 1, display: "flex", gap: 2, alignItems: "flex-start" }
              : {}
          }
        >
          {/* 左: 履歴リスト（表示専用時） */}
          {readOnly && (
            <Box
              sx={{
                width: 260,
                maxHeight: "60vh",
                overflowY: "auto",
                zIndex: 1500,
                pointerEvents: "auto",
              }}
            >
              {historiesLoading ? (
                <Box sx={{ p: 2 }}>
                  <LinearProgress />
                </Box>
              ) : sortedHistories && sortedHistories.length > 0 ? (
                <List dense disablePadding>
                  {sortedHistories.map((h, idx) => (
                    <ListItemButton
                      key={idx}
                      selected={idx === historyIndex}
                      onClick={() => {
                        setHistoryIndex(idx);
                        try {
                          applyHistory(idx);
                        } catch (e) {
                          // noop
                        }
                      }}
                    >
                      <ListItemText
                        primary={`履歴 #${sortedHistories.length - idx}`}
                        secondary={dayjs(h.createdAt).format(
                          "YYYY/MM/DD HH:mm:ss"
                        )}
                      />
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 2 }}>
                  <Alert severity="info">履歴がありません。</Alert>
                </Box>
              )}
            </Box>
          )}

          {/* 右: フォーム（常に表示） */}
          <Box sx={{ flexGrow: 1 }}>
            <Stack spacing={2} sx={{ px: 30 }}>
              {errors.startTime && (
                <Box>
                  <Alert severity="error">
                    <AlertTitle>入力内容に誤りがあります。</AlertTitle>
                    <Typography variant="body2">
                      {errors.startTime?.message}
                    </Typography>
                  </Alert>
                </Box>
              )}

              {!attendance && (
                <Box>
                  <Alert severity="info">
                    指定された日付に勤怠情報の登録がありません。保存時に新規作成されます。
                  </Alert>
                </Box>
              )}

              <Stack direction="row" spacing={1}>
                {!readOnly && <EditAttendanceHistoryList />}
                {!readOnly && <SystemCommentList />}
              </Stack>

              {!readOnly && (
                <GroupContainer>
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

              <GroupContainer>
                <Box>
                  <WorkDateItem
                    staffId={targetStaffId}
                    workDate={workDate}
                    MoveDateItemComponent={MoveDateItem}
                  />
                </Box>
              </GroupContainer>

              <GroupContainer>
                <Stack spacing={2}>
                  <StaffNameItem />
                  <WorkTypeItem />
                </Stack>
              </GroupContainer>

              <GroupContainer>
                <WorkTimeItem />
                <GoDirectlyFlagCheckbox
                  name="goDirectlyFlag"
                  control={control}
                  disabled={changeRequests.length > 0 || !!readOnly}
                  onChangeExtra={(checked) => {
                    if (checked)
                      setValue("startTime", getStartTime().toISOString());
                  }}
                />
                <ReturnDirectlyFlagInput />

                <Stack direction="row">
                  <Box
                    sx={{ fontWeight: "bold", width: "150px" }}
                  >{`休憩時間(${restFields.length}件)`}</Box>
                  <Stack spacing={1} sx={{ flexGrow: 2 }}>
                    {restFields.length === 0 && (
                      <Stack direction="column" spacing={1}>
                        <Alert severity="info">
                          昼休憩はスタッフが退勤打刻時に{lunchRestStartTime}〜
                          {lunchRestEndTime}で自動打刻されます。
                        </Alert>
                        {visibleRestWarning && (
                          <Box>
                            <LunchRestTimeNotSetWarning
                              targetWorkDate={targetWorkDate}
                            />
                          </Box>
                        )}
                      </Stack>
                    )}

                    {restFields.map((rest, index) => (
                      <RestTimeItem key={index} rest={rest} index={index} />
                    ))}

                    <Box>
                      <IconButton
                        aria-label="staff-search"
                        onClick={() =>
                          restAppend({ startTime: null, endTime: null })
                        }
                        disabled={!!readOnly}
                      >
                        <AddAlarmIcon />
                      </IconButton>
                    </Box>
                  </Stack>
                </Stack>

                <Box>
                  <SeparatorItem />
                </Box>

                <Box>
                  <ProductionTimeItem
                    time={totalProductionTime}
                    hourlyPaidHolidayHours={totalHourlyPaidHolidayTime}
                  />
                </Box>
              </GroupContainer>

              {/* 休暇タブ群（長いので省略せず既存ロジックを再利用） */}
              <GroupContainer>
                {(() => {
                  const tabs: { label: string; panel: JSX.Element }[] = [];
                  // 振替休日
                  tabs.push({
                    label: "振替休日",
                    panel: (
                      <TabPanel value={vacationTab} index={tabs.length}>
                        <SubstituteHolidayDateInput />
                      </TabPanel>
                    ),
                  });
                  // 有給(1日)
                  tabs.push({
                    label: "有給(1日)",
                    panel: (
                      <TabPanel value={vacationTab} index={tabs.length}>
                        <PaidHolidayFlagInputCommon
                          label="有給休暇(1日)"
                          control={control}
                          setValue={setValue}
                          workDate={
                            workDate ? workDate.toISOString() : undefined
                          }
                          setPaidHolidayTimes={true}
                          disabled={changeRequests.length > 0 || !!readOnly}
                          restReplace={restReplace}
                          getValues={getValues}
                        />
                      </TabPanel>
                    ),
                  });
                  if (getAbsentEnabled && getAbsentEnabled()) {
                    tabs.push({
                      label: "欠勤",
                      panel: (
                        <TabPanel value={vacationTab} index={tabs.length}>
                          <Box sx={{ mt: 1 }}>
                            <Stack direction="row" alignItems={"center"}>
                              <Box sx={{ fontWeight: "bold", width: "150px" }}>
                                欠勤
                              </Box>
                              <Box>
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
                              </Box>
                            </Stack>
                          </Box>
                        </TabPanel>
                      ),
                    });
                  }
                  if (getSpecialHolidayEnabled && getSpecialHolidayEnabled()) {
                    tabs.push({
                      label: "特別休暇",
                      panel: (
                        <TabPanel value={vacationTab} index={tabs.length}>
                          <Box sx={{ mt: 1 }}>
                            <Stack direction="row" alignItems={"center"}>
                              <Box sx={{ fontWeight: "bold", width: "150px" }}>
                                特別休暇
                              </Box>
                              <Box>
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
                              </Box>
                            </Stack>
                          </Box>
                        </TabPanel>
                      ),
                    });
                  }
                  if (getHourlyPaidHolidayEnabled()) {
                    tabs.push({
                      label: `時間単位(${hourlyPaidHolidayTimeFields.length}件)`,
                      panel: (
                        <TabPanel value={vacationTab} index={tabs.length}>
                          <Stack spacing={1}>
                            <Stack direction="row">
                              <Box
                                sx={{ fontWeight: "bold", width: "150px" }}
                              >{`時間単位休暇(${hourlyPaidHolidayTimeFields.length}件)`}</Box>
                              <Stack spacing={1} sx={{ flexGrow: 2 }}>
                                {hourlyPaidHolidayTimeFields.length === 0 && (
                                  <Box
                                    sx={{
                                      color: "text.secondary",
                                      fontSize: 14,
                                    }}
                                  >
                                    時間単位休暇の時間帯を追加してください。
                                  </Box>
                                )}
                                {hourlyPaidHolidayTimeFields.map(
                                  (hourlyPaidHolidayTime, index) => (
                                    <HourlyPaidHolidayTimeItem
                                      key={hourlyPaidHolidayTime.id}
                                      time={hourlyPaidHolidayTime}
                                      index={index}
                                    />
                                  )
                                )}
                                <Box>
                                  <IconButton
                                    aria-label="add-hourly-paid-holiday-time"
                                    onClick={() =>
                                      hourlyPaidHolidayTimeAppend({
                                        startTime: null,
                                        endTime: null,
                                      })
                                    }
                                    disabled={!!readOnly}
                                  >
                                    <AddAlarmIcon />
                                  </IconButton>
                                </Box>
                              </Stack>
                            </Stack>
                          </Stack>
                        </TabPanel>
                      ),
                    });
                  }
                  // 指定休日
                  tabs.push({
                    label: "指定休日",
                    panel: (
                      <TabPanel value={vacationTab} index={tabs.length}>
                        <Box sx={{ mt: 1 }}>
                          <IsDeemedHolidayFlagInput
                            control={control}
                            name="isDeemedHoliday"
                            disabled={!(staff?.workType === "shift") || !!readOnly}
                            helperText={
                              staff?.workType === "shift"
                                ? undefined
                                : "※シフト勤務のスタッフのみ設定できます"
                            }
                          />
                        </Box>
                      </TabPanel>
                    ),
                  });

                  return (
                    <>
                      <Tabs
                        value={vacationTab}
                        onChange={(_, v) => setVacationTab(v)}
                        aria-label="vacation-tabs"
                        sx={{ borderBottom: 1, borderColor: "divider" }}
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
                })()}
              </GroupContainer>

              <GroupContainer title="備考">
                <RemarksItem />
              </GroupContainer>

              {!readOnly && (
                <GroupContainer>
                  {attendance?.updatedAt && (
                    <Stack direction="row" alignItems={"center"}>
                      <Box sx={{ fontWeight: "bold", width: "150px" }}>
                        最終更新日時
                      </Box>
                      <Box sx={{ flexGrow: 2 }}>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ pl: 1 }}
                        >
                          {dayjs(attendance.updatedAt).format(
                            "YYYY/MM/DD HH:mm:ss"
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                  <Box>
                    <Stack direction="row" alignItems={"center"}>
                      <Box sx={{ fontWeight: "bold", width: "150px" }}>
                        メール設定
                      </Box>
                      <Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={enabledSendMail}
                              onChange={() =>
                                setEnabledSendMail(!enabledSendMail)
                              }
                            />
                          }
                          label="スタッフに変更通知メールを送信する"
                        />
                      </Box>
                    </Stack>
                  </Box>
                </GroupContainer>
              )}

              <Stack
                direction="row"
                alignItems={"center"}
                justifyContent={"center"}
                spacing={3}
              >
                <Box>
                  {!readOnly && (
                    <SaveButton
                      onClick={handleSubmit(onSubmit)}
                      disabled={!isValid || !isDirty || isSubmitting}
                      startIcon={
                        isSubmitting ? <CircularProgress size={"24"} /> : null
                      }
                    >
                      保存
                    </SaveButton>
                  )}
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Box>
        <ChangeRequestDialog
          attendance={attendance}
          updateAttendance={updateAttendance}
          staff={staff}
        />
        {/* readOnly mode: don't overlay the whole page. Inputs/components
            should rely on their own `disabled`/`readOnly` props so the UI
            remains visible but non-editable where appropriate. */}
      </Stack>
    </AttendanceEditProvider>
  );
}
