export const upsertAttendanceByStaffAndDate = /* GraphQL */ `
  mutation CustomUpsertAttendanceByStaffAndDate(
    $input: UpsertAttendanceByStaffAndDateInput!
  ) {
    upsertAttendanceByStaffAndDate(input: $input) {
      id
      staffId
      workDate
      startTime
      endTime
      goDirectlyFlag
      returnDirectlyFlag
      absentFlag
      rests {
        startTime
        endTime
      }
      hourlyPaidHolidayTimes {
        startTime
        endTime
      }
      remarks
      paidHolidayFlag
      specialHolidayFlag
      isDeemedHoliday
      hourlyPaidHolidayHours
      substituteHolidayDate
      revision
      createdAt
      updatedAt
      __typename
    }
  }
`;
