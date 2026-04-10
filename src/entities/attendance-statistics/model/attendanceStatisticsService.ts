import fetchCloseDates from "@entities/attendance/model/closeDates/fetchCloseDates";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { attendancesByStaffId } from "@shared/api/graphql/documents/queries";
import type {
  Attendance,
  AttendancesByStaffIdQuery,
} from "@shared/api/graphql/types";
import { ModelSortDirection } from "@shared/api/graphql/types";
import type { GraphQLResult } from "aws-amplify/api";

import {
  attendanceStatisticsByStaffIdYear,
  createAttendanceStatisticsSnapshot,
  updateAttendanceStatisticsSnapshot,
} from "../api/documents";
import { aggregateAttendanceStatistics } from "./aggregation";
import type {
  AttendanceStatisticsProgress,
  AttendanceStatisticsSnapshot,
  AttendanceStatisticsStatus,
} from "./types";

const SNAPSHOT_PAGE_SIZE = 200;

type AttendanceStatisticsConnection = {
  attendanceStatisticsByStaffIdYear?: {
    items?: Array<AttendanceStatisticsSnapshot | null> | null;
  } | null;
};

type SnapshotMutationResult = {
  createAttendanceStatisticsSnapshot?: AttendanceStatisticsSnapshot | null;
  updateAttendanceStatisticsSnapshot?: AttendanceStatisticsSnapshot | null;
};

const nonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

const buildSnapshotId = (staffId: string, year: number) =>
  `attendance-statistics#${staffId}#${year}`;

const ASCENDING_SORT = ModelSortDirection.ASC;

async function fetchAttendanceStatisticsSnapshot(params: {
  staffId: string;
  year: number;
}) {
  const response = (await graphqlClient.graphql({
    query: attendanceStatisticsByStaffIdYear,
    variables: {
      staffId: params.staffId,
      year: { eq: params.year },
      limit: 1,
    },
    authMode: "userPool",
  })) as GraphQLResult<AttendanceStatisticsConnection>;

  if (response.errors?.length) {
    throw new Error(response.errors[0]?.message || "統計情報の取得に失敗しました。");
  }

  return (
    response.data?.attendanceStatisticsByStaffIdYear?.items?.filter(nonNullable)[0] ??
    null
  );
}

async function persistSnapshot(params: {
  current: AttendanceStatisticsSnapshot | null;
  staffId: string;
  year: number;
  patch: Record<string, unknown>;
}) {
  const snapshotId = params.current?.id ?? buildSnapshotId(params.staffId, params.year);
  const input = {
    id: snapshotId,
    staffId: params.staffId,
    year: params.year,
    ...params.patch,
  };

  const response = (await graphqlClient.graphql({
    query: params.current
      ? updateAttendanceStatisticsSnapshot
      : createAttendanceStatisticsSnapshot,
    variables: { input },
    authMode: "userPool",
  })) as GraphQLResult<SnapshotMutationResult>;

  if (response.errors?.length) {
    throw new Error(response.errors[0]?.message || "統計情報の保存に失敗しました。");
  }

  const snapshot =
    response.data?.updateAttendanceStatisticsSnapshot ??
    response.data?.createAttendanceStatisticsSnapshot ??
    null;

  if (!snapshot) {
    throw new Error("統計情報の保存結果が取得できませんでした。");
  }

  return snapshot;
}

async function fetchAttendancesByDateRange(params: {
  staffId: string;
  startDate: string;
  endDate: string;
}) {
  const attendances: Attendance[] = [];
  let nextToken: string | null = null;

  do {
    const response = (await graphqlClient.graphql({
      query: attendancesByStaffId,
      variables: {
        staffId: params.staffId,
        workDate: {
          between: [params.startDate, params.endDate],
        },
        sortDirection: ASCENDING_SORT,
        limit: SNAPSHOT_PAGE_SIZE,
        nextToken,
      },
      authMode: "userPool",
    })) as GraphQLResult<AttendancesByStaffIdQuery>;

    if (response.errors?.length) {
      throw new Error(response.errors[0]?.message || "勤怠データの取得に失敗しました。");
    }

    const connection = response.data?.attendancesByStaffId;

    if (!connection) {
      throw new Error("勤怠データの取得に失敗しました。");
    }

    attendances.push(...connection.items.filter(nonNullable));
    nextToken = connection.nextToken ?? null;
  } while (nextToken);

  return attendances;
}

export async function rebuildAttendanceStatistics(params: {
  staffId: string;
  year: number;
  onProgress?: (progress: AttendanceStatisticsProgress) => void;
}) {
  const startedAt = new Date().toISOString();
  let currentSnapshot = await fetchAttendanceStatisticsSnapshot(params);

  const updateProgress = async (payload: {
    progressPercent: number;
    currentStepLabel: string;
    status?: AttendanceStatisticsStatus;
    patch?: Record<string, unknown>;
  }) => {
    params.onProgress?.({
      progressPercent: payload.progressPercent,
      currentStepLabel: payload.currentStepLabel,
      startedAt,
    });

    currentSnapshot = await persistSnapshot({
      current: currentSnapshot,
      staffId: params.staffId,
      year: params.year,
      patch: {
        status: payload.status ?? "RUNNING",
        progressPercent: payload.progressPercent,
        currentStepLabel: payload.currentStepLabel,
        startedAt,
        completedAt: null,
        errorMessage: null,
        ...payload.patch,
      },
    });
  };

  try {
    await updateProgress({
      progressPercent: 10,
      currentStepLabel: "集計期間を確認しています",
    });

    const closeDates = await fetchCloseDates();
    const rangePreview = aggregateAttendanceStatistics({
      attendances: [],
      closeDates,
      year: params.year,
    });

    await updateProgress({
      progressPercent: 35,
      currentStepLabel: "勤怠データを取得しています",
      patch: {
        rangeStart: rangePreview.rangeStart,
        rangeEnd: rangePreview.rangeEnd,
      },
    });

    const attendances = await fetchAttendancesByDateRange({
      staffId: params.staffId,
      startDate: rangePreview.rangeStart,
      endDate: rangePreview.rangeEnd,
    });

    await updateProgress({
      progressPercent: 70,
      currentStepLabel: "月別統計を計算しています",
    });

    const aggregated = aggregateAttendanceStatistics({
      attendances,
      closeDates,
      year: params.year,
    });

    currentSnapshot = await persistSnapshot({
      current: currentSnapshot,
      staffId: params.staffId,
      year: params.year,
      patch: {
        status: "SUCCEEDED",
        progressPercent: 100,
        currentStepLabel: "集計が完了しました",
        rangeStart: aggregated.rangeStart,
        rangeEnd: aggregated.rangeEnd,
        monthlySummaries: aggregated.monthlySummaries,
        totalWorkHours: aggregated.totalWorkHours,
        totalPaidDays: aggregated.totalPaidDays,
        totalSpecialHolidayDays: aggregated.totalSpecialHolidayDays,
        totalAbsentDays: aggregated.totalAbsentDays,
        totalWorkDays: aggregated.totalWorkDays,
        startedAt,
        completedAt: new Date().toISOString(),
        lastAggregatedAt: new Date().toISOString(),
        errorMessage: null,
      },
    });

    params.onProgress?.({
      progressPercent: 100,
      currentStepLabel: "集計が完了しました",
      startedAt,
    });

    return currentSnapshot;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "統計の再集計に失敗しました。";

    currentSnapshot = await persistSnapshot({
      current: currentSnapshot,
      staffId: params.staffId,
      year: params.year,
      patch: {
        status: "FAILED",
        progressPercent: currentSnapshot?.progressPercent ?? 0,
        currentStepLabel: "集計に失敗しました",
        startedAt,
        completedAt: new Date().toISOString(),
        errorMessage: message,
      },
    });

    throw new Error(message);
  }
}
