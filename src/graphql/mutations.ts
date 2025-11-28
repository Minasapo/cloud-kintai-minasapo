/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createCheckForUpdate = /* GraphQL */ `mutation CreateCheckForUpdate(
  $input: CreateCheckForUpdateInput!
  $condition: ModelCheckForUpdateConditionInput
) {
  createCheckForUpdate(input: $input, condition: $condition) {
    id
    deployUuid
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateCheckForUpdateMutationVariables,
  APITypes.CreateCheckForUpdateMutation
>;
export const updateCheckForUpdate = /* GraphQL */ `mutation UpdateCheckForUpdate(
  $input: UpdateCheckForUpdateInput!
  $condition: ModelCheckForUpdateConditionInput
) {
  updateCheckForUpdate(input: $input, condition: $condition) {
    id
    deployUuid
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateCheckForUpdateMutationVariables,
  APITypes.UpdateCheckForUpdateMutation
>;
export const deleteCheckForUpdate = /* GraphQL */ `mutation DeleteCheckForUpdate(
  $input: DeleteCheckForUpdateInput!
  $condition: ModelCheckForUpdateConditionInput
) {
  deleteCheckForUpdate(input: $input, condition: $condition) {
    id
    deployUuid
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteCheckForUpdateMutationVariables,
  APITypes.DeleteCheckForUpdateMutation
>;
export const createAppConfig = /* GraphQL */ `mutation CreateAppConfig(
  $input: CreateAppConfigInput!
  $condition: ModelAppConfigConditionInput
) {
  createAppConfig(input: $input, condition: $condition) {
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
    themeColor
    shiftGroups {
      label
      description
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateAppConfigMutationVariables,
  APITypes.CreateAppConfigMutation
>;
export const updateAppConfig = /* GraphQL */ `mutation UpdateAppConfig(
  $input: UpdateAppConfigInput!
  $condition: ModelAppConfigConditionInput
) {
  updateAppConfig(input: $input, condition: $condition) {
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
    themeColor
    shiftGroups {
      label
      description
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateAppConfigMutationVariables,
  APITypes.UpdateAppConfigMutation
>;
export const deleteAppConfig = /* GraphQL */ `mutation DeleteAppConfig(
  $input: DeleteAppConfigInput!
  $condition: ModelAppConfigConditionInput
) {
  deleteAppConfig(input: $input, condition: $condition) {
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
    themeColor
    shiftGroups {
      label
      description
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteAppConfigMutationVariables,
  APITypes.DeleteAppConfigMutation
>;
export const createStaff = /* GraphQL */ `mutation CreateStaff(
  $input: CreateStaffInput!
  $condition: ModelStaffConditionInput
) {
  createStaff(input: $input, condition: $condition) {
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
    developer
    approverSetting
    approverSingle
    approverMultiple
    approverMultipleMode
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateStaffMutationVariables,
  APITypes.CreateStaffMutation
>;
export const updateStaff = /* GraphQL */ `mutation UpdateStaff(
  $input: UpdateStaffInput!
  $condition: ModelStaffConditionInput
) {
  updateStaff(input: $input, condition: $condition) {
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
    developer
    approverSetting
    approverSingle
    approverMultiple
    approverMultipleMode
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateStaffMutationVariables,
  APITypes.UpdateStaffMutation
>;
export const deleteStaff = /* GraphQL */ `mutation DeleteStaff(
  $input: DeleteStaffInput!
  $condition: ModelStaffConditionInput
) {
  deleteStaff(input: $input, condition: $condition) {
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
    developer
    approverSetting
    approverSingle
    approverMultiple
    approverMultipleMode
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteStaffMutationVariables,
  APITypes.DeleteStaffMutation
>;
export const createHolidayCalendar = /* GraphQL */ `mutation CreateHolidayCalendar(
  $input: CreateHolidayCalendarInput!
  $condition: ModelHolidayCalendarConditionInput
) {
  createHolidayCalendar(input: $input, condition: $condition) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateHolidayCalendarMutationVariables,
  APITypes.CreateHolidayCalendarMutation
>;
export const updateHolidayCalendar = /* GraphQL */ `mutation UpdateHolidayCalendar(
  $input: UpdateHolidayCalendarInput!
  $condition: ModelHolidayCalendarConditionInput
) {
  updateHolidayCalendar(input: $input, condition: $condition) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateHolidayCalendarMutationVariables,
  APITypes.UpdateHolidayCalendarMutation
>;
export const deleteHolidayCalendar = /* GraphQL */ `mutation DeleteHolidayCalendar(
  $input: DeleteHolidayCalendarInput!
  $condition: ModelHolidayCalendarConditionInput
) {
  deleteHolidayCalendar(input: $input, condition: $condition) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteHolidayCalendarMutationVariables,
  APITypes.DeleteHolidayCalendarMutation
>;
export const createCompanyHolidayCalendar = /* GraphQL */ `mutation CreateCompanyHolidayCalendar(
  $input: CreateCompanyHolidayCalendarInput!
  $condition: ModelCompanyHolidayCalendarConditionInput
) {
  createCompanyHolidayCalendar(input: $input, condition: $condition) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateCompanyHolidayCalendarMutationVariables,
  APITypes.CreateCompanyHolidayCalendarMutation
>;
export const updateCompanyHolidayCalendar = /* GraphQL */ `mutation UpdateCompanyHolidayCalendar(
  $input: UpdateCompanyHolidayCalendarInput!
  $condition: ModelCompanyHolidayCalendarConditionInput
) {
  updateCompanyHolidayCalendar(input: $input, condition: $condition) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateCompanyHolidayCalendarMutationVariables,
  APITypes.UpdateCompanyHolidayCalendarMutation
>;
export const deleteCompanyHolidayCalendar = /* GraphQL */ `mutation DeleteCompanyHolidayCalendar(
  $input: DeleteCompanyHolidayCalendarInput!
  $condition: ModelCompanyHolidayCalendarConditionInput
) {
  deleteCompanyHolidayCalendar(input: $input, condition: $condition) {
    id
    holidayDate
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteCompanyHolidayCalendarMutationVariables,
  APITypes.DeleteCompanyHolidayCalendarMutation
>;
export const createCloseDate = /* GraphQL */ `mutation CreateCloseDate(
  $input: CreateCloseDateInput!
  $condition: ModelCloseDateConditionInput
) {
  createCloseDate(input: $input, condition: $condition) {
    id
    closeDate
    startDate
    endDate
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateCloseDateMutationVariables,
  APITypes.CreateCloseDateMutation
>;
export const updateCloseDate = /* GraphQL */ `mutation UpdateCloseDate(
  $input: UpdateCloseDateInput!
  $condition: ModelCloseDateConditionInput
) {
  updateCloseDate(input: $input, condition: $condition) {
    id
    closeDate
    startDate
    endDate
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateCloseDateMutationVariables,
  APITypes.UpdateCloseDateMutation
>;
export const deleteCloseDate = /* GraphQL */ `mutation DeleteCloseDate(
  $input: DeleteCloseDateInput!
  $condition: ModelCloseDateConditionInput
) {
  deleteCloseDate(input: $input, condition: $condition) {
    id
    closeDate
    startDate
    endDate
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteCloseDateMutationVariables,
  APITypes.DeleteCloseDateMutation
>;
export const createAttendance = /* GraphQL */ `mutation CreateAttendance(
  $input: CreateAttendanceInput!
  $condition: ModelAttendanceConditionInput
) {
  createAttendance(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateAttendanceMutationVariables,
  APITypes.CreateAttendanceMutation
>;
export const updateAttendance = /* GraphQL */ `mutation UpdateAttendance(
  $input: UpdateAttendanceInput!
  $condition: ModelAttendanceConditionInput
) {
  updateAttendance(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateAttendanceMutationVariables,
  APITypes.UpdateAttendanceMutation
>;
export const deleteAttendance = /* GraphQL */ `mutation DeleteAttendance(
  $input: DeleteAttendanceInput!
  $condition: ModelAttendanceConditionInput
) {
  deleteAttendance(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteAttendanceMutationVariables,
  APITypes.DeleteAttendanceMutation
>;
export const createDocument = /* GraphQL */ `mutation CreateDocument(
  $input: CreateDocumentInput!
  $condition: ModelDocumentConditionInput
) {
  createDocument(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateDocumentMutationVariables,
  APITypes.CreateDocumentMutation
>;
export const updateDocument = /* GraphQL */ `mutation UpdateDocument(
  $input: UpdateDocumentInput!
  $condition: ModelDocumentConditionInput
) {
  updateDocument(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateDocumentMutationVariables,
  APITypes.UpdateDocumentMutation
>;
export const deleteDocument = /* GraphQL */ `mutation DeleteDocument(
  $input: DeleteDocumentInput!
  $condition: ModelDocumentConditionInput
) {
  deleteDocument(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteDocumentMutationVariables,
  APITypes.DeleteDocumentMutation
>;
export const createWorkflow = /* GraphQL */ `mutation CreateWorkflow(
  $input: CreateWorkflowInput!
  $condition: ModelWorkflowConditionInput
) {
  createWorkflow(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateWorkflowMutationVariables,
  APITypes.CreateWorkflowMutation
>;
export const updateWorkflow = /* GraphQL */ `mutation UpdateWorkflow(
  $input: UpdateWorkflowInput!
  $condition: ModelWorkflowConditionInput
) {
  updateWorkflow(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateWorkflowMutationVariables,
  APITypes.UpdateWorkflowMutation
>;
export const deleteWorkflow = /* GraphQL */ `mutation DeleteWorkflow(
  $input: DeleteWorkflowInput!
  $condition: ModelWorkflowConditionInput
) {
  deleteWorkflow(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteWorkflowMutationVariables,
  APITypes.DeleteWorkflowMutation
>;
export const createOperationLog = /* GraphQL */ `mutation CreateOperationLog(
  $input: CreateOperationLogInput!
  $condition: ModelOperationLogConditionInput
) {
  createOperationLog(input: $input, condition: $condition) {
    id
    staffId
    action
    resource
    resourceId
    timestamp
    details
    ipAddress
    userAgent
    metadata
    severity
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateOperationLogMutationVariables,
  APITypes.CreateOperationLogMutation
>;
export const updateOperationLog = /* GraphQL */ `mutation UpdateOperationLog(
  $input: UpdateOperationLogInput!
  $condition: ModelOperationLogConditionInput
) {
  updateOperationLog(input: $input, condition: $condition) {
    id
    staffId
    action
    resource
    resourceId
    timestamp
    details
    ipAddress
    userAgent
    metadata
    severity
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateOperationLogMutationVariables,
  APITypes.UpdateOperationLogMutation
>;
export const deleteOperationLog = /* GraphQL */ `mutation DeleteOperationLog(
  $input: DeleteOperationLogInput!
  $condition: ModelOperationLogConditionInput
) {
  deleteOperationLog(input: $input, condition: $condition) {
    id
    staffId
    action
    resource
    resourceId
    timestamp
    details
    ipAddress
    userAgent
    metadata
    severity
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteOperationLogMutationVariables,
  APITypes.DeleteOperationLogMutation
>;
