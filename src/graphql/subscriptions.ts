/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateCheckForUpdate = /* GraphQL */ `subscription OnCreateCheckForUpdate(
  $filter: ModelSubscriptionCheckForUpdateFilterInput
) {
  onCreateCheckForUpdate(filter: $filter) {
    id
    deployUuid
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateCheckForUpdateSubscriptionVariables,
  APITypes.OnCreateCheckForUpdateSubscription
>;
export const onUpdateCheckForUpdate = /* GraphQL */ `subscription OnUpdateCheckForUpdate(
  $filter: ModelSubscriptionCheckForUpdateFilterInput
) {
  onUpdateCheckForUpdate(filter: $filter) {
    id
    deployUuid
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateCheckForUpdateSubscriptionVariables,
  APITypes.OnUpdateCheckForUpdateSubscription
>;
export const onDeleteCheckForUpdate = /* GraphQL */ `subscription OnDeleteCheckForUpdate(
  $filter: ModelSubscriptionCheckForUpdateFilterInput
) {
  onDeleteCheckForUpdate(filter: $filter) {
    id
    deployUuid
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteCheckForUpdateSubscriptionVariables,
  APITypes.OnDeleteCheckForUpdateSubscription
>;
export const onCreateAppConfig = /* GraphQL */ `subscription OnCreateAppConfig($filter: ModelSubscriptionAppConfigFilterInput) {
  onCreateAppConfig(filter: $filter) {
    id
    name
    workStartTime
    workEndTime
    lunchRestStartTime
    lunchRestEndTime
    amHolidayStartTime
    amHolidayEndTime
    pmHolidayStartTime
    pmHolidayEndTime
    amPmHolidayEnabled
    officeMode
    hourlyPaidHolidayEnabled
    links {
      label
      url
      enabled
      icon
      __typename
    }
    reasons {
      reason
      enabled
      __typename
    }
    quickInputStartTimes {
      time
      enabled
      __typename
    }
    quickInputEndTimes {
      time
      enabled
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateAppConfigSubscriptionVariables,
  APITypes.OnCreateAppConfigSubscription
>;
export const onUpdateAppConfig = /* GraphQL */ `subscription OnUpdateAppConfig($filter: ModelSubscriptionAppConfigFilterInput) {
  onUpdateAppConfig(filter: $filter) {
    id
    name
    workStartTime
    workEndTime
    lunchRestStartTime
    lunchRestEndTime
    amHolidayStartTime
    amHolidayEndTime
    pmHolidayStartTime
    pmHolidayEndTime
    amPmHolidayEnabled
    officeMode
    hourlyPaidHolidayEnabled
    links {
      label
      url
      enabled
      icon
      __typename
    }
    reasons {
      reason
      enabled
      __typename
    }
    quickInputStartTimes {
      time
      enabled
      __typename
    }
    quickInputEndTimes {
      time
      enabled
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateAppConfigSubscriptionVariables,
  APITypes.OnUpdateAppConfigSubscription
>;
export const onDeleteAppConfig = /* GraphQL */ `subscription OnDeleteAppConfig($filter: ModelSubscriptionAppConfigFilterInput) {
  onDeleteAppConfig(filter: $filter) {
    id
    name
    workStartTime
    workEndTime
    lunchRestStartTime
    lunchRestEndTime
    amHolidayStartTime
    amHolidayEndTime
    pmHolidayStartTime
    pmHolidayEndTime
    amPmHolidayEnabled
    officeMode
    hourlyPaidHolidayEnabled
    links {
      label
      url
      enabled
      icon
      __typename
    }
    reasons {
      reason
      enabled
      __typename
    }
    quickInputStartTimes {
      time
      enabled
      __typename
    }
    quickInputEndTimes {
      time
      enabled
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteAppConfigSubscriptionVariables,
  APITypes.OnDeleteAppConfigSubscription
>;
export const onCreateStaff = /* GraphQL */ `subscription OnCreateStaff($filter: ModelSubscriptionStaffFilterInput) {
  onCreateStaff(filter: $filter) {
    id
    cognitoUserId
    familyName
    givenName
    mailAddress
    role
    enabled
    status
    owner
    usageStartDate
    notifications {
      workStart
      workEnd
      __typename
    }
    sortKey
    workType
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateStaffSubscriptionVariables,
  APITypes.OnCreateStaffSubscription
>;
export const onUpdateStaff = /* GraphQL */ `subscription OnUpdateStaff($filter: ModelSubscriptionStaffFilterInput) {
  onUpdateStaff(filter: $filter) {
    id
    cognitoUserId
    familyName
    givenName
    mailAddress
    role
    enabled
    status
    owner
    usageStartDate
    notifications {
      workStart
      workEnd
      __typename
    }
    sortKey
    workType
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateStaffSubscriptionVariables,
  APITypes.OnUpdateStaffSubscription
>;
export const onDeleteStaff = /* GraphQL */ `subscription OnDeleteStaff($filter: ModelSubscriptionStaffFilterInput) {
  onDeleteStaff(filter: $filter) {
    id
    cognitoUserId
    familyName
    givenName
    mailAddress
    role
    enabled
    status
    owner
    usageStartDate
    notifications {
      workStart
      workEnd
      __typename
    }
    sortKey
    workType
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteStaffSubscriptionVariables,
  APITypes.OnDeleteStaffSubscription
>;
export const onCreateHolidayCalendar = /* GraphQL */ `subscription OnCreateHolidayCalendar(
  $filter: ModelSubscriptionHolidayCalendarFilterInput
) {
  onCreateHolidayCalendar(filter: $filter) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateHolidayCalendarSubscriptionVariables,
  APITypes.OnCreateHolidayCalendarSubscription
>;
export const onUpdateHolidayCalendar = /* GraphQL */ `subscription OnUpdateHolidayCalendar(
  $filter: ModelSubscriptionHolidayCalendarFilterInput
) {
  onUpdateHolidayCalendar(filter: $filter) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateHolidayCalendarSubscriptionVariables,
  APITypes.OnUpdateHolidayCalendarSubscription
>;
export const onDeleteHolidayCalendar = /* GraphQL */ `subscription OnDeleteHolidayCalendar(
  $filter: ModelSubscriptionHolidayCalendarFilterInput
) {
  onDeleteHolidayCalendar(filter: $filter) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteHolidayCalendarSubscriptionVariables,
  APITypes.OnDeleteHolidayCalendarSubscription
>;
export const onCreateCompanyHolidayCalendar = /* GraphQL */ `subscription OnCreateCompanyHolidayCalendar(
  $filter: ModelSubscriptionCompanyHolidayCalendarFilterInput
) {
  onCreateCompanyHolidayCalendar(filter: $filter) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateCompanyHolidayCalendarSubscriptionVariables,
  APITypes.OnCreateCompanyHolidayCalendarSubscription
>;
export const onUpdateCompanyHolidayCalendar = /* GraphQL */ `subscription OnUpdateCompanyHolidayCalendar(
  $filter: ModelSubscriptionCompanyHolidayCalendarFilterInput
) {
  onUpdateCompanyHolidayCalendar(filter: $filter) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateCompanyHolidayCalendarSubscriptionVariables,
  APITypes.OnUpdateCompanyHolidayCalendarSubscription
>;
export const onDeleteCompanyHolidayCalendar = /* GraphQL */ `subscription OnDeleteCompanyHolidayCalendar(
  $filter: ModelSubscriptionCompanyHolidayCalendarFilterInput
) {
  onDeleteCompanyHolidayCalendar(filter: $filter) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteCompanyHolidayCalendarSubscriptionVariables,
  APITypes.OnDeleteCompanyHolidayCalendarSubscription
>;
export const onCreateCloseDate = /* GraphQL */ `subscription OnCreateCloseDate($filter: ModelSubscriptionCloseDateFilterInput) {
  onCreateCloseDate(filter: $filter) {
    id
    closeDate
    startDate
    endDate
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateCloseDateSubscriptionVariables,
  APITypes.OnCreateCloseDateSubscription
>;
export const onUpdateCloseDate = /* GraphQL */ `subscription OnUpdateCloseDate($filter: ModelSubscriptionCloseDateFilterInput) {
  onUpdateCloseDate(filter: $filter) {
    id
    closeDate
    startDate
    endDate
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateCloseDateSubscriptionVariables,
  APITypes.OnUpdateCloseDateSubscription
>;
export const onDeleteCloseDate = /* GraphQL */ `subscription OnDeleteCloseDate($filter: ModelSubscriptionCloseDateFilterInput) {
  onDeleteCloseDate(filter: $filter) {
    id
    closeDate
    startDate
    endDate
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteCloseDateSubscriptionVariables,
  APITypes.OnDeleteCloseDateSubscription
>;
export const onCreateAttendance = /* GraphQL */ `subscription OnCreateAttendance(
  $filter: ModelSubscriptionAttendanceFilterInput
) {
  onCreateAttendance(filter: $filter) {
    id
    staffId
    workDate
    startTime
    endTime
    goDirectlyFlag
    returnDirectlyFlag
    rests {
      startTime
      endTime
      __typename
    }
    hourlyPaidHolidayTimes {
      startTime
      endTime
      __typename
    }
    remarks
    paidHolidayFlag
    isDeemedHoliday
    hourlyPaidHolidayHours
    substituteHolidayDate
    histories {
      staffId
      workDate
      startTime
      endTime
      goDirectlyFlag
      returnDirectlyFlag
      rests {
        startTime
        endTime
        __typename
      }
      hourlyPaidHolidayTimes {
        startTime
        endTime
        __typename
      }
      remarks
      paidHolidayFlag
      hourlyPaidHolidayHours
      substituteHolidayFlag
      substituteHolidayDate
      createdAt
      __typename
    }
    changeRequests {
      startTime
      endTime
      goDirectlyFlag
      returnDirectlyFlag
      rests {
        startTime
        endTime
        __typename
      }
      hourlyPaidHolidayTimes {
        startTime
        endTime
        __typename
      }
      remarks
      paidHolidayFlag
      hourlyPaidHolidayHours
      substituteHolidayFlag
      substituteHolidayDate
      completed
      comment
      staffComment
      __typename
    }
    systemComments {
      comment
      confirmed
      createdAt
      __typename
    }
    revision
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateAttendanceSubscriptionVariables,
  APITypes.OnCreateAttendanceSubscription
>;
export const onUpdateAttendance = /* GraphQL */ `subscription OnUpdateAttendance(
  $filter: ModelSubscriptionAttendanceFilterInput
) {
  onUpdateAttendance(filter: $filter) {
    id
    staffId
    workDate
    startTime
    endTime
    goDirectlyFlag
    returnDirectlyFlag
    rests {
      startTime
      endTime
      __typename
    }
    hourlyPaidHolidayTimes {
      startTime
      endTime
      __typename
    }
    remarks
    paidHolidayFlag
    isDeemedHoliday
    hourlyPaidHolidayHours
    substituteHolidayDate
    histories {
      staffId
      workDate
      startTime
      endTime
      goDirectlyFlag
      returnDirectlyFlag
      rests {
        startTime
        endTime
        __typename
      }
      hourlyPaidHolidayTimes {
        startTime
        endTime
        __typename
      }
      remarks
      paidHolidayFlag
      hourlyPaidHolidayHours
      substituteHolidayFlag
      substituteHolidayDate
      createdAt
      __typename
    }
    changeRequests {
      startTime
      endTime
      goDirectlyFlag
      returnDirectlyFlag
      rests {
        startTime
        endTime
        __typename
      }
      hourlyPaidHolidayTimes {
        startTime
        endTime
        __typename
      }
      remarks
      paidHolidayFlag
      hourlyPaidHolidayHours
      substituteHolidayFlag
      substituteHolidayDate
      completed
      comment
      staffComment
      __typename
    }
    systemComments {
      comment
      confirmed
      createdAt
      __typename
    }
    revision
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateAttendanceSubscriptionVariables,
  APITypes.OnUpdateAttendanceSubscription
>;
export const onDeleteAttendance = /* GraphQL */ `subscription OnDeleteAttendance(
  $filter: ModelSubscriptionAttendanceFilterInput
) {
  onDeleteAttendance(filter: $filter) {
    id
    staffId
    workDate
    startTime
    endTime
    goDirectlyFlag
    returnDirectlyFlag
    rests {
      startTime
      endTime
      __typename
    }
    hourlyPaidHolidayTimes {
      startTime
      endTime
      __typename
    }
    remarks
    paidHolidayFlag
    isDeemedHoliday
    hourlyPaidHolidayHours
    substituteHolidayDate
    histories {
      staffId
      workDate
      startTime
      endTime
      goDirectlyFlag
      returnDirectlyFlag
      rests {
        startTime
        endTime
        __typename
      }
      hourlyPaidHolidayTimes {
        startTime
        endTime
        __typename
      }
      remarks
      paidHolidayFlag
      hourlyPaidHolidayHours
      substituteHolidayFlag
      substituteHolidayDate
      createdAt
      __typename
    }
    changeRequests {
      startTime
      endTime
      goDirectlyFlag
      returnDirectlyFlag
      rests {
        startTime
        endTime
        __typename
      }
      hourlyPaidHolidayTimes {
        startTime
        endTime
        __typename
      }
      remarks
      paidHolidayFlag
      hourlyPaidHolidayHours
      substituteHolidayFlag
      substituteHolidayDate
      completed
      comment
      staffComment
      __typename
    }
    systemComments {
      comment
      confirmed
      createdAt
      __typename
    }
    revision
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteAttendanceSubscriptionVariables,
  APITypes.OnDeleteAttendanceSubscription
>;
export const onCreateDocument = /* GraphQL */ `subscription OnCreateDocument($filter: ModelSubscriptionDocumentFilterInput) {
  onCreateDocument(filter: $filter) {
    id
    title
    content
    tag
    targetRole
    revision
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateDocumentSubscriptionVariables,
  APITypes.OnCreateDocumentSubscription
>;
export const onUpdateDocument = /* GraphQL */ `subscription OnUpdateDocument($filter: ModelSubscriptionDocumentFilterInput) {
  onUpdateDocument(filter: $filter) {
    id
    title
    content
    tag
    targetRole
    revision
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateDocumentSubscriptionVariables,
  APITypes.OnUpdateDocumentSubscription
>;
export const onDeleteDocument = /* GraphQL */ `subscription OnDeleteDocument($filter: ModelSubscriptionDocumentFilterInput) {
  onDeleteDocument(filter: $filter) {
    id
    title
    content
    tag
    targetRole
    revision
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteDocumentSubscriptionVariables,
  APITypes.OnDeleteDocumentSubscription
>;
