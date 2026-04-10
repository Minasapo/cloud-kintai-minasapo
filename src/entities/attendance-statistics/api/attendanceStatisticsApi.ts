import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlBaseQuery } from "@shared/api/graphql/graphqlBaseQuery";

import type { AttendanceStatisticsSnapshot } from "../model/types";
import { attendanceStatisticsByStaffIdYear } from "./documents";

type AttendanceStatisticsConnection = {
  attendanceStatisticsByStaffIdYear?: {
    items?: Array<AttendanceStatisticsSnapshot | null> | null;
    nextToken?: string | null;
  } | null;
};

const nonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export const attendanceStatisticsApi = createApi({
  reducerPath: "attendanceStatisticsApi",
  baseQuery: graphqlBaseQuery(),
  tagTypes: ["AttendanceStatistics"],
  endpoints: (builder) => ({
    getAttendanceStatisticsSnapshot: builder.query<
      AttendanceStatisticsSnapshot | null,
      { staffId: string; year: number }
    >({
      async queryFn({ staffId, year }, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: attendanceStatisticsByStaffIdYear,
          variables: {
            staffId,
            year: { eq: year },
            limit: 1,
          },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as AttendanceStatisticsConnection | null;
        const item =
          data?.attendanceStatisticsByStaffIdYear?.items?.filter(nonNullable)[0] ??
          null;

        return { data: item };
      },
      providesTags: (_result, _error, arg) => [
        { type: "AttendanceStatistics", id: `${arg.staffId}:${arg.year}` },
      ],
    }),
  }),
});

export const { useGetAttendanceStatisticsSnapshotQuery } =
  attendanceStatisticsApi;
