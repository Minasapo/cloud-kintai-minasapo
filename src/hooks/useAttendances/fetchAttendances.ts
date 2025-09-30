import { GraphQLResult } from "@aws-amplify/api";
import { API } from "aws-amplify";
import dayjs from "dayjs";

import { AttendanceDate } from "@/lib/AttendanceDate";

import { Attendance, AttendancesByStaffIdQuery } from "../../API";
import { attendancesByStaffId } from "../../graphql/queries";

export default async function fetchAttendances(staffId: string) {
  const now = dayjs();
  const dateList = Array.from({ length: 30 }, (_, i) =>
    now.subtract(i, "day").format(AttendanceDate.DataFormat)
  ).sort();

  const attendances: Attendance[] = [];
  const response = (await API.graphql({
    query: attendancesByStaffId,
    variables: {
      staffId: staffId,
      workDate: {
        between: [dateList[0], dateList[dateList.length - 1]],
      },
    },
    authMode: "AMAZON_COGNITO_USER_POOLS",
  })) as GraphQLResult<AttendancesByStaffIdQuery>;

  if (response.errors) {
    throw new Error(response.errors[0].message);
  }

  if (!response.data?.attendancesByStaffId) {
    throw new Error("Failed to fetch attendance");
  }

  attendances.push(
    ...response.data.attendancesByStaffId.items.filter(
      (item): item is NonNullable<typeof item> => item !== null
    )
  );

  /**
   * 一覧表示用の Attendance オブジェクトを構築するヘルパー。
   *
   * 理由: GraphQL スキーマは将来変更される可能性があります（フィールドの
   * 追加/削除）。ここで明示的にマッピングしておくことで、どのフィールドが
   * 一覧に渡されているかが一目で分かり、追加漏れを防げます。
   * 例: 新しく `absentFlag` をスキーマに追加した場合は、この関数に追記して
   *     一覧に値が渡るようにしてください。
   */
  function buildAttendanceForList(
    targetDate: string,
    matchAttendance?: Attendance | null
  ): Attendance {
    return {
      __typename: "Attendance",
      id: matchAttendance?.id ?? "",
      staffId: matchAttendance?.staffId ?? "",
      workDate: targetDate,
      // 時刻フィールド
      startTime: matchAttendance?.startTime ?? "",
      endTime: matchAttendance?.endTime ?? "",
      // 重要: 欠勤フラグ。スキーマ更新時にこのマッピングを忘れないこと。
      absentFlag: matchAttendance?.absentFlag ?? false,
      // その他フラグ
      goDirectlyFlag: matchAttendance?.goDirectlyFlag ?? false,
      returnDirectlyFlag: matchAttendance?.returnDirectlyFlag ?? false,
      // コレクション
      rests: matchAttendance?.rests ?? [],
      // 備考・休暇フラグ
      remarks: matchAttendance?.remarks ?? "",
      paidHolidayFlag: matchAttendance?.paidHolidayFlag ?? false,
      specialHolidayFlag: matchAttendance?.specialHolidayFlag ?? false,
      isDeemedHoliday: matchAttendance?.isDeemedHoliday ?? false,
      substituteHolidayDate: matchAttendance?.substituteHolidayDate,
      changeRequests: matchAttendance?.changeRequests
        ? matchAttendance.changeRequests.filter(
            (item): item is NonNullable<typeof item> => item !== null
          )
        : [],
      createdAt: matchAttendance?.createdAt ?? "",
      updatedAt: matchAttendance?.updatedAt ?? "",
    };
  }

  return dateList.map((targetDate): Attendance => {
    const matchAttendance = attendances.find(
      (attendance) => attendance.workDate === targetDate
    );

    return buildAttendanceForList(targetDate, matchAttendance ?? null);
  });
}
