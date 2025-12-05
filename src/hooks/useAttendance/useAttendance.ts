import dayjs from "dayjs";
import { useCallback, useState } from "react";

import {
  Attendance,
  CreateAttendanceInput,
  RestInput,
  SystemCommentInput,
  UpdateAttendanceInput,
} from "@/API";
import {
  useCreateAttendanceMutation,
  useLazyGetAttendanceByStaffAndDateQuery,
  useUpdateAttendanceMutation,
} from "@/lib/api/attendanceApi";
import { AttendanceDateTime } from "@/lib/AttendanceDateTime";

export enum GoDirectlyFlag {
  YES,
  NO,
}

export enum ReturnDirectlyFlag {
  YES,
  NO,
}

export default function useAttendance() {
  const [attendance, setAttendance] = useState<Attendance | undefined | null>(
    undefined
  );
  const [loading, setLoading] = useState(true);

  const [triggerGetAttendance] = useLazyGetAttendanceByStaffAndDateQuery();
  const [createAttendanceMutation] = useCreateAttendanceMutation();
  const [updateAttendanceMutation] = useUpdateAttendanceMutation();

  const getAttendance = useCallback(
    async (staffId: string, workDate: string) => {
      setLoading(true);
      try {
        const result = await triggerGetAttendance({
          staffId,
          workDate,
        }).unwrap();
        setAttendance(result ?? null);
        return result;
      } finally {
        setLoading(false);
      }
    },
    [triggerGetAttendance]
  );

  const createAttendance = useCallback(
    async (input: CreateAttendanceInput) => {
      const created = await createAttendanceMutation(input).unwrap();
      setAttendance(created);
      return created;
    },
    [createAttendanceMutation]
  );

  const updateAttendance = useCallback(
    async (input: UpdateAttendanceInput) => {
      const updated = await updateAttendanceMutation(input).unwrap();
      setAttendance(updated);
      return updated;
    },
    [updateAttendanceMutation]
  );

  const clockIn = async (
    staffId: string,
    workDate: string,
    startTime: string,
    goDirectlyFlag = GoDirectlyFlag.NO
  ) => {
    if (attendance) {
      return updateAttendance({
        id: attendance.id,
        startTime,
        goDirectlyFlag: goDirectlyFlag === GoDirectlyFlag.YES,
        isDeemedHoliday: attendance.isDeemedHoliday,
        revision: attendance.revision,
      }).catch((e: Error) => {
        throw e;
      });
    }

    return createAttendance({
      staffId,
      workDate,
      startTime,
      goDirectlyFlag: goDirectlyFlag === GoDirectlyFlag.YES,
    }).catch((e: Error) => {
      throw e;
    });
  };

  const clockOut = async (
    staffId: string,
    workDate: string,
    endTime: string,
    returnDirectlyFlag = ReturnDirectlyFlag.NO
  ) => {
    if (attendance) {
      const startTime = dayjs(attendance.startTime);
      const noon = new AttendanceDateTime().setNoon().toDayjs();
      const isWorkStartBeforeNoon = startTime.isBefore(noon);
      const isWorkEndBeforeNoon = dayjs(endTime).isBefore(noon);
      const systemComments = attendance.systemComments
        ? attendance.systemComments
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .map(
              ({ comment, confirmed, createdAt }) =>
                ({
                  comment,
                  confirmed,
                  createdAt,
                } as SystemCommentInput)
            )
        : [];

      const rests = (() => {
        const prevRests = attendance.rests
          ? attendance.rests
              .filter((item): item is NonNullable<typeof item> => item !== null)
              .map(
                (item): RestInput => ({
                  startTime: item.startTime,
                  endTime: item.endTime,
                })
              )
          : [];

        // 勤務開始が12時以降の場合 or 勤務終了が12時以前の場合
        if (!isWorkStartBeforeNoon || isWorkEndBeforeNoon) {
          return prevRests;
        }

        const lunchBreakStart = new AttendanceDateTime()
          .setRestStart()
          .toDayjs();
        const lunchBreakEnd = new AttendanceDateTime().setRestEnd().toDayjs();

        if (prevRests.length > 0) {
          systemComments.push({
            comment:
              "既に休憩時間が登録されていたため、退勤時に昼休憩を自動追加しませんでした。",
            confirmed: false,
            createdAt: dayjs().toISOString(),
          });

          return prevRests;
        }

        prevRests.push({
          startTime: lunchBreakStart.toISOString(),
          endTime: lunchBreakEnd.toISOString(),
        });

        return prevRests;
      })();

      return updateAttendance({
        id: attendance.id,
        endTime,
        returnDirectlyFlag: returnDirectlyFlag === ReturnDirectlyFlag.YES,
        rests,
        isDeemedHoliday: attendance.isDeemedHoliday,
        systemComments,
        revision: attendance.revision,
      }).catch((e: Error) => {
        throw e;
      });
    }

    return createAttendance({
      staffId,
      workDate,
      endTime,
      returnDirectlyFlag: returnDirectlyFlag === ReturnDirectlyFlag.YES,
    }).catch((e: Error) => {
      throw e;
    });
  };

  const restStart = async (
    staffId: string,
    workDate: string,
    startTime: string
  ) => {
    if (attendance) {
      if (!attendance.startTime) {
        throw new Error("Not clocked in");
      }

      const rests = attendance.rests
        ? attendance.rests
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .map(
              (item): RestInput => ({
                startTime: item.startTime,
                endTime: item.endTime,
              })
            )
        : [];

      const isMismatch =
        rests.filter((rest) => !rest.startTime || !rest.endTime).length > 0;
      if (isMismatch) {
        throw new Error("There is a problem with the rest time");
      }

      rests.push({ startTime });

      return updateAttendance({
        id: attendance.id,
        rests,
        isDeemedHoliday: attendance.isDeemedHoliday,
        revision: attendance.revision,
      }).catch((e: Error) => {
        throw e;
      });
    }

    return createAttendance({
      staffId,
      workDate,
      rests: [
        {
          startTime,
        },
      ],
    }).catch((e: Error) => {
      throw e;
    });
  };

  const restEnd = async (
    staffId: string,
    workDate: string,
    endTime: string
  ) => {
    if (attendance) {
      if (!attendance.startTime) {
        throw new Error("Not clocked in");
      }

      const rests = attendance.rests
        ? attendance.rests
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .map(
              (item): RestInput => ({
                startTime: item.startTime,
                endTime: item.endTime,
              })
            )
        : [];

      if (rests.length === 0) {
        throw new Error("There is no rest start");
      }

      const isMismatch =
        rests.filter((rest) => !rest.startTime || !rest.endTime).length >= 2;

      if (isMismatch) {
        throw new Error("There is a problem with the rest time");
      }

      const isLatestMismatch = !rests[rests.length - 1].startTime;

      if (isLatestMismatch) {
        throw new Error("There is a problem with the rest time");
      }

      rests[rests.length - 1].endTime = endTime;

      return updateAttendance({
        id: attendance.id,
        rests,
        revision: attendance.revision,
      }).catch((e: Error) => {
        throw e;
      });
    }

    return createAttendance({
      staffId,
      workDate,
      rests: [
        {
          endTime,
        },
      ],
    }).catch((e: Error) => {
      throw e;
    });
  };

  const updateRemarks = async (
    staffId: string,
    workDate: string,
    remarks: string
  ) => {
    if (attendance) {
      return updateAttendance({
        id: attendance.id,
        remarks,
        isDeemedHoliday: attendance.isDeemedHoliday,
        revision: attendance.revision,
      }).catch((e: Error) => {
        throw e;
      });
    }

    return createAttendance({
      staffId,
      workDate,
      remarks,
    }).catch((e: Error) => {
      throw e;
    });
  };

  return {
    attendance,
    loading,
    getAttendance,
    createAttendance,
    updateAttendance,
    clockIn,
    clockOut,
    restStart,
    restEnd,
    updateRemarks,
  };
}
