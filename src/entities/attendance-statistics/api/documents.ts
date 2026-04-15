const attendanceStatisticsSnapshotSelection = /* GraphQL */ `
  id
  staffId
  year
  status
  progressPercent
  currentStepLabel
  rangeStart
  rangeEnd
  monthlySummaries {
    month
    rangeStart
    rangeEnd
    workHours
    paidDays
    specialHolidayDays
    absentDays
    workDays
    isFallback
    __typename
  }
  totalWorkHours
  totalPaidDays
  totalSpecialHolidayDays
  totalAbsentDays
  totalWorkDays
  startedAt
  completedAt
  lastAggregatedAt
  errorMessage
  createdAt
  updatedAt
  __typename
`;

export const attendanceStatisticsByStaffIdYear = /* GraphQL */ `
  query AttendanceStatisticsByStaffIdYear(
    $staffId: String!
    $year: ModelIntKeyConditionInput
    $limit: Int
    $nextToken: String
  ) {
    attendanceStatisticsByStaffIdYear(
      staffId: $staffId
      year: $year
      limit: $limit
      nextToken: $nextToken
      sortDirection: ASC
    ) {
      items {
        ${attendanceStatisticsSnapshotSelection}
      }
      nextToken
      __typename
    }
  }
`;

export const createAttendanceStatisticsSnapshot = /* GraphQL */ `
  mutation CreateAttendanceStatisticsSnapshot(
    $input: CreateAttendanceStatisticsSnapshotInput!
  ) {
    createAttendanceStatisticsSnapshot(input: $input) {
      ${attendanceStatisticsSnapshotSelection}
    }
  }
`;

export const updateAttendanceStatisticsSnapshot = /* GraphQL */ `
  mutation UpdateAttendanceStatisticsSnapshot(
    $input: UpdateAttendanceStatisticsSnapshotInput!
  ) {
    updateAttendanceStatisticsSnapshot(input: $input) {
      ${attendanceStatisticsSnapshotSelection}
    }
  }
`;
