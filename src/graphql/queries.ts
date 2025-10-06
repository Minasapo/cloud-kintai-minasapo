/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const sendMail = /* GraphQL */ `query SendMail($data: EmailData!) {
  sendMail(data: $data) {
    statusCode
    body
    __typename
  }
}
` as GeneratedQuery<APITypes.SendMailQueryVariables, APITypes.SendMailQuery>;
export const getCheckForUpdate = /* GraphQL */ `query GetCheckForUpdate($id: ID!) {
  getCheckForUpdate(id: $id) {
    id
    deployUuid
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCheckForUpdateQueryVariables,
  APITypes.GetCheckForUpdateQuery
>;
export const listCheckForUpdates = /* GraphQL */ `query ListCheckForUpdates(
  $filter: ModelCheckForUpdateFilterInput
  $limit: Int
  $nextToken: String
) {
  listCheckForUpdates(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      deployUuid
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCheckForUpdatesQueryVariables,
  APITypes.ListCheckForUpdatesQuery
>;
export const getAppConfig = /* GraphQL */ `query GetAppConfig($id: ID!) {
  getAppConfig(id: $id) {
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
    specialHolidayEnabled
    amPmHolidayEnabled
    officeMode
    absentEnabled
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
` as GeneratedQuery<
  APITypes.GetAppConfigQueryVariables,
  APITypes.GetAppConfigQuery
>;
export const listAppConfigs = /* GraphQL */ `query ListAppConfigs(
  $filter: ModelAppConfigFilterInput
  $limit: Int
  $nextToken: String
) {
  listAppConfigs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
      specialHolidayEnabled
      amPmHolidayEnabled
      officeMode
      absentEnabled
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAppConfigsQueryVariables,
  APITypes.ListAppConfigsQuery
>;
export const getStaff = /* GraphQL */ `query GetStaff($id: ID!) {
  getStaff(id: $id) {
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
    approverSetting
    approverSingle
    approverMultiple
    approverMultipleMode
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetStaffQueryVariables, APITypes.GetStaffQuery>;
export const listStaff = /* GraphQL */ `query ListStaff(
  $filter: ModelStaffFilterInput
  $limit: Int
  $nextToken: String
) {
  listStaff(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
      approverSetting
      approverSingle
      approverMultiple
      approverMultipleMode
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListStaffQueryVariables, APITypes.ListStaffQuery>;
export const staffByCognitoUserId = /* GraphQL */ `query StaffByCognitoUserId(
  $cognitoUserId: String!
  $id: ModelIDKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelStaffFilterInput
  $limit: Int
  $nextToken: String
) {
  staffByCognitoUserId(
    cognitoUserId: $cognitoUserId
    id: $id
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
      approverSetting
      approverSingle
      approverMultiple
      approverMultipleMode
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.StaffByCognitoUserIdQueryVariables,
  APITypes.StaffByCognitoUserIdQuery
>;
export const getHolidayCalendar = /* GraphQL */ `query GetHolidayCalendar($id: ID!) {
  getHolidayCalendar(id: $id) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetHolidayCalendarQueryVariables,
  APITypes.GetHolidayCalendarQuery
>;
export const listHolidayCalendars = /* GraphQL */ `query ListHolidayCalendars(
  $filter: ModelHolidayCalendarFilterInput
  $limit: Int
  $nextToken: String
) {
  listHolidayCalendars(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      holidayDate
      name
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListHolidayCalendarsQueryVariables,
  APITypes.ListHolidayCalendarsQuery
>;
export const getCompanyHolidayCalendar = /* GraphQL */ `query GetCompanyHolidayCalendar($id: ID!) {
  getCompanyHolidayCalendar(id: $id) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCompanyHolidayCalendarQueryVariables,
  APITypes.GetCompanyHolidayCalendarQuery
>;
export const listCompanyHolidayCalendars = /* GraphQL */ `query ListCompanyHolidayCalendars(
  $filter: ModelCompanyHolidayCalendarFilterInput
  $limit: Int
  $nextToken: String
) {
  listCompanyHolidayCalendars(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      holidayDate
      name
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCompanyHolidayCalendarsQueryVariables,
  APITypes.ListCompanyHolidayCalendarsQuery
>;
export const getCloseDate = /* GraphQL */ `query GetCloseDate($id: ID!) {
  getCloseDate(id: $id) {
    id
    closeDate
    startDate
    endDate
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCloseDateQueryVariables,
  APITypes.GetCloseDateQuery
>;
export const listCloseDates = /* GraphQL */ `query ListCloseDates(
  $filter: ModelCloseDateFilterInput
  $limit: Int
  $nextToken: String
) {
  listCloseDates(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      closeDate
      startDate
      endDate
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCloseDatesQueryVariables,
  APITypes.ListCloseDatesQuery
>;
export const getAttendance = /* GraphQL */ `query GetAttendance($id: ID!) {
  getAttendance(id: $id) {
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
      __typename
    }
    hourlyPaidHolidayTimes {
      startTime
      endTime
      __typename
    }
    remarks
    paidHolidayFlag
    specialHolidayFlag
    isDeemedHoliday
    hourlyPaidHolidayHours
    substituteHolidayDate
    histories {
      staffId
      workDate
      startTime
      endTime
      goDirectlyFlag
      absentFlag
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
      specialHolidayFlag
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
      absentFlag
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
      specialHolidayFlag
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
` as GeneratedQuery<
  APITypes.GetAttendanceQueryVariables,
  APITypes.GetAttendanceQuery
>;
export const listAttendances = /* GraphQL */ `query ListAttendances(
  $filter: ModelAttendanceFilterInput
  $limit: Int
  $nextToken: String
) {
  listAttendances(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
        __typename
      }
      hourlyPaidHolidayTimes {
        startTime
        endTime
        __typename
      }
      remarks
      paidHolidayFlag
      specialHolidayFlag
      isDeemedHoliday
      hourlyPaidHolidayHours
      substituteHolidayDate
      histories {
        staffId
        workDate
        startTime
        endTime
        goDirectlyFlag
        absentFlag
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
        specialHolidayFlag
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
        absentFlag
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
        specialHolidayFlag
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAttendancesQueryVariables,
  APITypes.ListAttendancesQuery
>;
export const attendancesByStaffId = /* GraphQL */ `query AttendancesByStaffId(
  $staffId: String!
  $workDate: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelAttendanceFilterInput
  $limit: Int
  $nextToken: String
) {
  attendancesByStaffId(
    staffId: $staffId
    workDate: $workDate
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
        __typename
      }
      hourlyPaidHolidayTimes {
        startTime
        endTime
        __typename
      }
      remarks
      paidHolidayFlag
      specialHolidayFlag
      isDeemedHoliday
      hourlyPaidHolidayHours
      substituteHolidayDate
      histories {
        staffId
        workDate
        startTime
        endTime
        goDirectlyFlag
        absentFlag
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
        specialHolidayFlag
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
        absentFlag
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
        specialHolidayFlag
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.AttendancesByStaffIdQueryVariables,
  APITypes.AttendancesByStaffIdQuery
>;
export const getDocument = /* GraphQL */ `query GetDocument($id: ID!) {
  getDocument(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetDocumentQueryVariables,
  APITypes.GetDocumentQuery
>;
export const listDocuments = /* GraphQL */ `query ListDocuments(
  $filter: ModelDocumentFilterInput
  $limit: Int
  $nextToken: String
) {
  listDocuments(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDocumentsQueryVariables,
  APITypes.ListDocumentsQuery
>;
export const getWorkflow = /* GraphQL */ `query GetWorkflow($id: ID!) {
  getWorkflow(id: $id) {
    id
    approvedStaffIds
    rejectedStaffIds
    finalDecisionTimestamp
    category
    staffId
    status
    assignedApproverStaffIds
    approvalSteps {
      id
      approverStaffId
      decisionStatus
      approverComment
      decisionTimestamp
      stepOrder
      __typename
    }
    nextApprovalStepIndex
    submitterApproverSetting
    submitterApproverId
    submitterApproverIds
    submitterApproverMultipleMode
    overTimeDetails {
      date
      startTime
      endTime
      reason
      __typename
    }
    comments {
      id
      staffId
      text
      createdAt
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetWorkflowQueryVariables,
  APITypes.GetWorkflowQuery
>;
export const listWorkflows = /* GraphQL */ `query ListWorkflows(
  $filter: ModelWorkflowFilterInput
  $limit: Int
  $nextToken: String
) {
  listWorkflows(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      approvedStaffIds
      rejectedStaffIds
      finalDecisionTimestamp
      category
      staffId
      status
      assignedApproverStaffIds
      approvalSteps {
        id
        approverStaffId
        decisionStatus
        approverComment
        decisionTimestamp
        stepOrder
        __typename
      }
      nextApprovalStepIndex
      submitterApproverSetting
      submitterApproverId
      submitterApproverIds
      submitterApproverMultipleMode
      overTimeDetails {
        date
        startTime
        endTime
        reason
        __typename
      }
      comments {
        id
        staffId
        text
        createdAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListWorkflowsQueryVariables,
  APITypes.ListWorkflowsQuery
>;
export const workflowsByStaffId = /* GraphQL */ `query WorkflowsByStaffId(
  $staffId: String!
  $sortDirection: ModelSortDirection
  $filter: ModelWorkflowFilterInput
  $limit: Int
  $nextToken: String
) {
  workflowsByStaffId(
    staffId: $staffId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      approvedStaffIds
      rejectedStaffIds
      finalDecisionTimestamp
      category
      staffId
      status
      assignedApproverStaffIds
      approvalSteps {
        id
        approverStaffId
        decisionStatus
        approverComment
        decisionTimestamp
        stepOrder
        __typename
      }
      nextApprovalStepIndex
      submitterApproverSetting
      submitterApproverId
      submitterApproverIds
      submitterApproverMultipleMode
      overTimeDetails {
        date
        startTime
        endTime
        reason
        __typename
      }
      comments {
        id
        staffId
        text
        createdAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.WorkflowsByStaffIdQueryVariables,
  APITypes.WorkflowsByStaffIdQuery
>;
