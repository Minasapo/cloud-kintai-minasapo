import AddAlarmIcon from "@mui/icons-material/AddAlarm";
import {
  Alert,
  AlertTitle,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Stack,
  styled,
  Switch,
  Typography,
} from "@mui/material";
import { Logger } from "aws-amplify";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";

import { SystemCommentInput } from "@/API";
import { GoDirectlyFlagCheckbox } from "@/components/attendance_editor/GoDirectlyFlagCheckbox";
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

export default function AttendanceEditor() {
  const {
    getLunchRestStartTime,
    getLunchRestEndTime,
    getHourlyPaidHolidayEnabled,
    getStartTime,
    loading: appConfigLoading,
  } = useAppConfig();
  const dispatch = useAppDispatchV2();

  const { targetWorkDate, staffId: targetStaffId } = useParams();
  const { staffs, loading: staffsLoading, error: staffSError } = useStaffs();
  const { attendance, getAttendance, updateAttendance, createAttendance } =
    useAttendance();
  const [staff, setStaff] = useState<StaffType | undefined | null>(undefined);
  const [workDate, setWorkDate] = useState<dayjs.Dayjs | null>(null);
  const [enabledSendMail, setEnabledSendMail] = useState<boolean>(true);

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

    getAttendance(
      staff.cognitoUserId,
      new AttendanceDateTime().setDateString(targetWorkDate).toDataFormat()
    ).catch((e: Error) => {
      logger.debug(e);
      dispatch(setSnackbarError(MESSAGE_CODE.E02001));
    });
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
      console.log("data", data.systemComments);

      if (attendance) {
        await updateAttendance({
          id: attendance.id,
          staffId: attendance.staffId,
          workDate: data.workDate,
          startTime: data.startTime,
          endTime: data.endTime || null,
          goDirectlyFlag: data.goDirectlyFlag,
          returnDirectlyFlag: data.returnDirectlyFlag,
          remarks: data.remarks,
          revision: data.revision,
          paidHolidayFlag: data.paidHolidayFlag,
          substituteHolidayDate: data.substituteHolidayDate,
          rests: data.rests.map((rest) => ({
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
          hourlyPaidHolidayTimes:
            (data.hourlyPaidHolidayTimes
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
            if (!staff || !res.histories) return;

            if (enabledSendMail) {
              new AttendanceEditMailSender(staff, res).changeRequest();
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
        staffId: targetStaffId,
        workDate: new AttendanceDateTime()
          .setDateString(targetWorkDate)
          .toDataFormat(),
        startTime: data.startTime,
        endTime: data.endTime,
        goDirectlyFlag: data.goDirectlyFlag,
        returnDirectlyFlag: data.returnDirectlyFlag,
        remarks: data.remarks,
        paidHolidayFlag: data.paidHolidayFlag,
        substituteHolidayDate: data.substituteHolidayDate,
        rests: data.rests.map((rest) => ({
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
        hourlyPaidHolidayTimes:
          (data.hourlyPaidHolidayTimes
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
    setValue("endTime", attendance.endTime);
    setValue("remarks", attendance.remarks || "");
    setValue("goDirectlyFlag", attendance.goDirectlyFlag || false);
    setValue("returnDirectlyFlag", attendance.returnDirectlyFlag || false);
    setValue("paidHolidayFlag", attendance.paidHolidayFlag || false);
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
        </Box>
        <Stack spacing={2} sx={{ px: 30 }}>
          <Box>
            {errors.startTime && (
              <Box>
                <Alert severity="error">
                  <AlertTitle>入力内容に誤りがあります。</AlertTitle>
                  <Typography variant="body2">
                    {errors.startTime.message}
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
          </Box>
          <Stack direction="row" spacing={1}>
            <EditAttendanceHistoryList />
            <SystemCommentList />
          </Stack>
          <GroupContainer>
            <QuickInputButtons
              setValue={setValue}
              restReplace={restReplace}
              hourlyPaidHolidayTimeReplace={hourlyPaidHolidayTimeReplace}
              workDate={workDate}
            />
          </GroupContainer>
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
              disabled={changeRequests.length > 0}
              onChangeExtra={(checked) => {
                if (checked) {
                  setValue("startTime", getStartTime().toISOString());
                }
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
                      restAppend({
                        startTime: null,
                        endTime: null,
                      })
                    }
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
          <GroupContainer>
            <SubstituteHolidayDateInput />
            <PaidHolidayFlagInputCommon
              label="有給休暇(1日)"
              control={control}
              setValue={setValue}
              workDate={workDate ? workDate.toISOString() : undefined}
              setPaidHolidayTimes={true}
              disabled={changeRequests.length > 0}
            />
            {getHourlyPaidHolidayEnabled() && (
              <Stack spacing={1}>
                <Stack direction="row">
                  <Box
                    sx={{ fontWeight: "bold", width: "150px" }}
                  >{`時間単位休暇(${hourlyPaidHolidayTimeFields.length}件)`}</Box>
                  <Stack spacing={1} sx={{ flexGrow: 2 }}>
                    {hourlyPaidHolidayTimeFields.length === 0 && (
                      <Box sx={{ color: "text.secondary", fontSize: 14 }}>
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
                      >
                        <AddAlarmIcon />
                      </IconButton>
                    </Box>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </GroupContainer>
          <GroupContainer>
            <Box>
              <RemarksItem />
            </Box>
          </GroupContainer>
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
                    {dayjs(attendance.updatedAt).format("YYYY/MM/DD HH:mm:ss")}
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
                        onChange={() => setEnabledSendMail(!enabledSendMail)}
                      />
                    }
                    label="スタッフに変更通知メールを送信する"
                  />
                </Box>
              </Stack>
            </Box>
          </GroupContainer>
          <Stack
            direction="row"
            alignItems={"center"}
            justifyContent={"center"}
            spacing={3}
          >
            <Box>
              <SaveButton
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid || !isDirty || isSubmitting}
                startIcon={
                  isSubmitting ? <CircularProgress size={"24"} /> : null
                }
              >
                保存
              </SaveButton>
            </Box>
          </Stack>
        </Stack>
        <ChangeRequestDialog
          attendance={attendance}
          updateAttendance={updateAttendance}
          staff={staff}
        />
      </Stack>
    </AttendanceEditProvider>
  );
}
