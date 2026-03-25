import "./styles.scss";

import {
  useCreateAttendanceMutation,
  useGetAttendanceByStaffAndDateQuery,
  useUpdateAttendanceMutation,
} from "@entities/attendance/api/attendanceApi";
import { attendanceEditSchema } from "@entities/attendance/validation/attendanceEditSchema";
import { collectAttendanceErrorMessages } from "@entities/attendance/validation/collectErrorMessages";
import {
  StaffType,
  useStaffs,
} from "@entities/staff/model/useStaffs/useStaffs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useMemo } from "react";
import {
  useFieldArray,
  useForm,
  UseFormHandleSubmit,
} from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import * as MESSAGE_CODE from "@/errors";
import type { AttendanceEditContextProps } from "@/features/attendance/edit/model/AttendanceEditProvider";
import AttendanceEditProvider from "@/features/attendance/edit/model/AttendanceEditProvider";
import {
  AttendanceEditInputs,
  defaultValues,
} from "@/features/attendance/edit/model/common";
import DesktopEditor from "@/features/attendance/edit/ui/desktopEditor/DesktopEditor";
import { MobileEditor } from "@/features/attendance/edit/ui/mobileEditor/MobileEditor";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import { createLogger } from "@/shared/lib/logger";

import { AttendanceEditErrorAlert } from "./AttendanceEditErrorAlert";
import { buildChangeRequestPayload } from "./attendanceEditUtils";
import sendChangeRequestMail from "./sendChangeRequestMail";
import { useAttendanceEditFormSync } from "./useAttendanceEditFormSync";

const logger = createLogger("AttendanceEdit");

const MONTH_QUERY_KEY = "month";

export default function AttendanceEdit() {
  const { notify } = useLocalNotification();
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const {
    getHourlyPaidHolidayEnabled,
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
  } = useContext(AppConfigContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { targetWorkDate } = useParams();

  const attendanceListPath = useMemo(() => {
    const month = searchParams.get(MONTH_QUERY_KEY);
    if (!month) {
      return "/attendance/list";
    }

    return `/attendance/list?${new URLSearchParams({
      [MONTH_QUERY_KEY]: month,
    }).toString()}`;
  }, [searchParams]);

  const isAuthenticated = authStatus === "authenticated";
  const {
    staffs,
    loading: staffsLoading,
    error: staffSError,
  } = useStaffs({
    isAuthenticated,
  });
  const [createAttendanceMutation] = useCreateAttendanceMutation();
  const [updateAttendanceMutation] = useUpdateAttendanceMutation();

  const createAttendance = useCallback(
    (input: Parameters<typeof createAttendanceMutation>[0]) =>
      createAttendanceMutation(input).unwrap(),
    [createAttendanceMutation],
  );

  const updateAttendance = useCallback(
    (input: Parameters<typeof updateAttendanceMutation>[0]) =>
      updateAttendanceMutation(input).unwrap(),
    [updateAttendanceMutation],
  );

  const targetWorkDateISO = useMemo(() => {
    if (!targetWorkDate) {
      return null;
    }

    return dayjs(targetWorkDate).format(AttendanceDate.DataFormat);
  }, [targetWorkDate]);

  const staff = useMemo<StaffType | null | undefined>(() => {
    if (!cognitoUser?.id) return undefined;
    const { id: staffId } = cognitoUser;
    return staffs.find((s) => s.cognitoUserId === staffId) || null;
  }, [staffs, cognitoUser]);

  const staffId = staff?.cognitoUserId ?? null;
  const shouldFetchAttendance = Boolean(staffId && targetWorkDateISO);

  const {
    data: attendanceData,
    isLoading: isAttendanceInitialLoading,
    isFetching: isAttendanceFetching,
    isUninitialized: isAttendanceUninitialized,
    error: attendanceError,
  } = useGetAttendanceByStaffAndDateQuery(
    {
      staffId: staffId ?? "",
      workDate: targetWorkDateISO ?? "",
    },
    { skip: !shouldFetchAttendance },
  );

  const attendance: Attendance | null = attendanceData ?? null;

  const attendanceLoading =
    !shouldFetchAttendance ||
    isAttendanceInitialLoading ||
    isAttendanceFetching ||
    isAttendanceUninitialized;

  const {
    register,
    control,
    setValue,
    getValues,
    watch,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting, errors },
  } = useForm<AttendanceEditInputs>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(attendanceEditSchema),
  });

  const {
    fields: restFields,
    append: restAppend,
    remove: restRemove,
    update: restUpdate,
    replace: restReplace,
  } = useFieldArray({
    control,
    name: "rests",
  });

  const {
    fields: hourlyPaidHolidayTimeFields,
    append: hourlyPaidHolidayTimeAppend,
    remove: hourlyPaidHolidayTimeRemove,
    update: hourlyPaidHolidayTimeUpdate,
    replace: hourlyPaidHolidayTimeReplace,
  } = useFieldArray({
    control,
    name: "hourlyPaidHolidayTimes",
  });

  const hourlyPaidHolidayEnabled = getHourlyPaidHolidayEnabled();

  const onSubmit = async (data: AttendanceEditInputs) => {
    const changeRequestPayload = buildChangeRequestPayload(data);

    if (attendance) {
      await updateAttendance({
        id: attendance.id,
        changeRequests: [changeRequestPayload],
        revision: attendance.revision,
      })
        .then(() => {
          if (!cognitoUser) return;

          try {
            void sendChangeRequestMail(
              cognitoUser,
              dayjs(attendance.workDate),
              staffs,
              data.staffComment,
            );
          } catch (mailError) {
            logger.error("Failed to send change request mail:", mailError);
            void notify("メール送信エラー", {
              body: MESSAGE_CODE.E00002,
              mode: "await-interaction",
              priority: "normal",
              tag: "mail-error",
            });
          }

          void notify("修正申請完了", {
            body: MESSAGE_CODE.S02005,
            mode: "auto-close",
            tag: "attendance-change-request",
          });

          navigate(attendanceListPath);
        })
        .catch(() => {
          void notify("修正申請エラー", {
            body: MESSAGE_CODE.E02005,
            mode: "await-interaction",
            priority: "high",
            tag: "attendance-change-request-error",
          });
        });
    } else {
      if (!staff || !targetWorkDate) return;

      await createAttendance({
        staffId: staff.cognitoUserId,
        workDate: dayjs(targetWorkDate).format(AttendanceDate.DataFormat),
        changeRequests: [changeRequestPayload],
      })
        .then(() => {
          void notify("修正申請完了", {
            body: MESSAGE_CODE.S02005,
            mode: "auto-close",
            tag: "attendance-change-request",
          });

          if (!cognitoUser) return;
          try {
            void sendChangeRequestMail(
              cognitoUser,
              dayjs(targetWorkDate),
              staffs,
              data.staffComment,
            );
          } catch (mailError) {
            console.error("Failed to send change request mail:", mailError);
            void notify("メール送信エラー", {
              body: MESSAGE_CODE.E00002,
              mode: "await-interaction",
              priority: "normal",
              tag: "mail-error",
            });
          }
          navigate(attendanceListPath);
        })
        .catch((e) => {
          logger.error("Failed to update attendance:", e);
          void notify("修正申請エラー", {
            body: MESSAGE_CODE.E02005,
            mode: "await-interaction",
            priority: "high",
            tag: "attendance-change-request-error",
          });
        });
    }
  };

  useEffect(() => {
    if (!shouldFetchAttendance || !attendanceError) {
      return;
    }

    void notify("データ取得エラー", {
      body: MESSAGE_CODE.E02001,
      mode: "await-interaction",
      priority: "high",
      tag: "attendance-fetch-error",
    });
  }, [attendanceError, shouldFetchAttendance, notify]);

  const { isOnBreak } = useAttendanceEditFormSync({
    control,
    setValue,
    getValues,
    reset,
    restReplace,
    hourlyPaidHolidayTimeReplace,
    attendance,
    targetWorkDate,
    targetWorkDateISO,
    staffId,
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
  });

  const changeRequests = attendance?.changeRequests
    ? attendance.changeRequests
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .filter((item) => !item.completed)
    : [];
  const errorMessages = useMemo(
    () => collectAttendanceErrorMessages(errors),
    [errors],
  );

  if (!targetWorkDate) {
    return null;
  }

  if (staffsLoading || attendanceLoading) {
    return (
      <div
        className="attendance-edit__loading"
        data-testid="attendance-loading"
      >
        <div className="attendance-edit__loading-track">
          <div className="attendance-edit__loading-bar" />
        </div>
      </div>
    );
  }

  if (staffSError) {
    void notify("エラー", {
      body: MESSAGE_CODE.E00001,
      mode: "await-interaction",
      priority: "high",
      tag: "staff-fetch-error",
    });
    return null;
  }

  const attendanceEditContextValue: AttendanceEditContextProps = {
    workDate: dayjs(targetWorkDate),
    attendance,
    staff,
    onSubmit,
    register,
    control,
    setValue,
    getValues,
    watch,
    handleSubmit:
      handleSubmit as unknown as UseFormHandleSubmit<AttendanceEditInputs>,
    isDirty,
    isValid,
    isSubmitting,
    restFields,
    restAppend,
    restRemove,
    restUpdate,
    restReplace,
    changeRequests,
    systemCommentFields: [],
    hourlyPaidHolidayTimeFields,
    hourlyPaidHolidayTimeAppend,
    hourlyPaidHolidayTimeRemove,
    hourlyPaidHolidayTimeUpdate,
    hourlyPaidHolidayTimeReplace,
    hourlyPaidHolidayEnabled,
    isOnBreak,
  };

  return (
    <AttendanceEditProvider value={attendanceEditContextValue}>
      <div
        data-testid="attendance-edit-root"
        className="attendance-edit-root mx-auto w-full md:max-w-[1280px]"
      >
        <AttendanceEditErrorAlert messages={errorMessages} />
        <div className="block md:hidden" data-testid="attendance-mobile-editor">
          <MobileEditor />
        </div>
        <div
          className="hidden md:block"
          data-testid="attendance-desktop-editor"
        >
          <DesktopEditor />
        </div>
      </div>
    </AttendanceEditProvider>
  );
}
