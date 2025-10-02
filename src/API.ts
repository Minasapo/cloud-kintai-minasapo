/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateCheckForUpdateInput = {
  id?: string | null,
  deployUuid: string,
};

export type ModelCheckForUpdateConditionInput = {
  deployUuid?: ModelStringInput | null,
  and?: Array< ModelCheckForUpdateConditionInput | null > | null,
  or?: Array< ModelCheckForUpdateConditionInput | null > | null,
  not?: ModelCheckForUpdateConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type CheckForUpdate = {
  __typename: "CheckForUpdate",
  id: string,
  deployUuid: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateCheckForUpdateInput = {
  id: string,
  deployUuid?: string | null,
};

export type DeleteCheckForUpdateInput = {
  id: string,
};

export type CreateAppConfigInput = {
  id?: string | null,
  name: string,
  workStartTime?: string | null,
  workEndTime?: string | null,
  lunchRestStartTime?: string | null,
  lunchRestEndTime?: string | null,
  amHolidayStartTime?: string | null,
  amHolidayEndTime?: string | null,
  pmHolidayStartTime?: string | null,
  pmHolidayEndTime?: string | null,
  specialHolidayEnabled?: boolean | null,
  amPmHolidayEnabled?: boolean | null,
  officeMode?: boolean | null,
  absentEnabled?: boolean | null,
  hourlyPaidHolidayEnabled?: boolean | null,
  links?: Array< LinkInput | null > | null,
  reasons?: Array< ReasonInput | null > | null,
  quickInputStartTimes?: Array< QuickInputTimeInput | null > | null,
  quickInputEndTimes?: Array< QuickInputTimeInput | null > | null,
};

export type LinkInput = {
  label: string,
  url: string,
  enabled: boolean,
  icon?: string | null,
};

export type ReasonInput = {
  reason: string,
  enabled: boolean,
};

export type QuickInputTimeInput = {
  time: string,
  enabled: boolean,
};

export type ModelAppConfigConditionInput = {
  name?: ModelStringInput | null,
  workStartTime?: ModelStringInput | null,
  workEndTime?: ModelStringInput | null,
  lunchRestStartTime?: ModelStringInput | null,
  lunchRestEndTime?: ModelStringInput | null,
  amHolidayStartTime?: ModelStringInput | null,
  amHolidayEndTime?: ModelStringInput | null,
  pmHolidayStartTime?: ModelStringInput | null,
  pmHolidayEndTime?: ModelStringInput | null,
  specialHolidayEnabled?: ModelBooleanInput | null,
  amPmHolidayEnabled?: ModelBooleanInput | null,
  officeMode?: ModelBooleanInput | null,
  absentEnabled?: ModelBooleanInput | null,
  hourlyPaidHolidayEnabled?: ModelBooleanInput | null,
  and?: Array< ModelAppConfigConditionInput | null > | null,
  or?: Array< ModelAppConfigConditionInput | null > | null,
  not?: ModelAppConfigConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type AppConfig = {
  __typename: "AppConfig",
  id: string,
  name: string,
  workStartTime?: string | null,
  workEndTime?: string | null,
  lunchRestStartTime?: string | null,
  lunchRestEndTime?: string | null,
  amHolidayStartTime?: string | null,
  amHolidayEndTime?: string | null,
  pmHolidayStartTime?: string | null,
  pmHolidayEndTime?: string | null,
  specialHolidayEnabled?: boolean | null,
  amPmHolidayEnabled?: boolean | null,
  officeMode?: boolean | null,
  absentEnabled?: boolean | null,
  hourlyPaidHolidayEnabled?: boolean | null,
  links?:  Array<Link | null > | null,
  reasons?:  Array<Reason | null > | null,
  quickInputStartTimes?:  Array<QuickInputTime | null > | null,
  quickInputEndTimes?:  Array<QuickInputTime | null > | null,
  createdAt: string,
  updatedAt: string,
};

export type Link = {
  __typename: "Link",
  label: string,
  url: string,
  enabled: boolean,
  icon?: string | null,
};

export type Reason = {
  __typename: "Reason",
  reason: string,
  enabled: boolean,
};

export type QuickInputTime = {
  __typename: "QuickInputTime",
  time: string,
  enabled: boolean,
};

export type UpdateAppConfigInput = {
  id: string,
  name?: string | null,
  workStartTime?: string | null,
  workEndTime?: string | null,
  lunchRestStartTime?: string | null,
  lunchRestEndTime?: string | null,
  amHolidayStartTime?: string | null,
  amHolidayEndTime?: string | null,
  pmHolidayStartTime?: string | null,
  pmHolidayEndTime?: string | null,
  specialHolidayEnabled?: boolean | null,
  amPmHolidayEnabled?: boolean | null,
  officeMode?: boolean | null,
  absentEnabled?: boolean | null,
  hourlyPaidHolidayEnabled?: boolean | null,
  links?: Array< LinkInput | null > | null,
  reasons?: Array< ReasonInput | null > | null,
  quickInputStartTimes?: Array< QuickInputTimeInput | null > | null,
  quickInputEndTimes?: Array< QuickInputTimeInput | null > | null,
};

export type DeleteAppConfigInput = {
  id: string,
};

export type CreateStaffInput = {
  id?: string | null,
  cognitoUserId: string,
  familyName?: string | null,
  givenName?: string | null,
  mailAddress: string,
  role: string,
  enabled: boolean,
  status: string,
  owner?: boolean | null,
  usageStartDate?: string | null,
  notifications?: NotificationInput | null,
  sortKey?: string | null,
  workType?: string | null,
};

export type NotificationInput = {
  workStart?: boolean | null,
  workEnd?: boolean | null,
};

export type ModelStaffConditionInput = {
  cognitoUserId?: ModelStringInput | null,
  familyName?: ModelStringInput | null,
  givenName?: ModelStringInput | null,
  mailAddress?: ModelStringInput | null,
  role?: ModelStringInput | null,
  enabled?: ModelBooleanInput | null,
  status?: ModelStringInput | null,
  owner?: ModelBooleanInput | null,
  usageStartDate?: ModelStringInput | null,
  sortKey?: ModelStringInput | null,
  workType?: ModelStringInput | null,
  and?: Array< ModelStaffConditionInput | null > | null,
  or?: Array< ModelStaffConditionInput | null > | null,
  not?: ModelStaffConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Staff = {
  __typename: "Staff",
  id: string,
  cognitoUserId: string,
  familyName?: string | null,
  givenName?: string | null,
  mailAddress: string,
  role: string,
  enabled: boolean,
  status: string,
  owner?: boolean | null,
  usageStartDate?: string | null,
  notifications?: Notification | null,
  sortKey?: string | null,
  workType?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type Notification = {
  __typename: "Notification",
  workStart?: boolean | null,
  workEnd?: boolean | null,
};

export type UpdateStaffInput = {
  id: string,
  cognitoUserId?: string | null,
  familyName?: string | null,
  givenName?: string | null,
  mailAddress?: string | null,
  role?: string | null,
  enabled?: boolean | null,
  status?: string | null,
  owner?: boolean | null,
  usageStartDate?: string | null,
  notifications?: NotificationInput | null,
  sortKey?: string | null,
  workType?: string | null,
};

export type DeleteStaffInput = {
  id: string,
};

export type CreateHolidayCalendarInput = {
  id?: string | null,
  holidayDate: string,
  name: string,
};

export type ModelHolidayCalendarConditionInput = {
  holidayDate?: ModelStringInput | null,
  name?: ModelStringInput | null,
  and?: Array< ModelHolidayCalendarConditionInput | null > | null,
  or?: Array< ModelHolidayCalendarConditionInput | null > | null,
  not?: ModelHolidayCalendarConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type HolidayCalendar = {
  __typename: "HolidayCalendar",
  id: string,
  holidayDate: string,
  name: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateHolidayCalendarInput = {
  id: string,
  holidayDate?: string | null,
  name?: string | null,
};

export type DeleteHolidayCalendarInput = {
  id: string,
};

export type CreateCompanyHolidayCalendarInput = {
  id?: string | null,
  holidayDate: string,
  name: string,
};

export type ModelCompanyHolidayCalendarConditionInput = {
  holidayDate?: ModelStringInput | null,
  name?: ModelStringInput | null,
  and?: Array< ModelCompanyHolidayCalendarConditionInput | null > | null,
  or?: Array< ModelCompanyHolidayCalendarConditionInput | null > | null,
  not?: ModelCompanyHolidayCalendarConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CompanyHolidayCalendar = {
  __typename: "CompanyHolidayCalendar",
  id: string,
  holidayDate: string,
  name: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateCompanyHolidayCalendarInput = {
  id: string,
  holidayDate?: string | null,
  name?: string | null,
};

export type DeleteCompanyHolidayCalendarInput = {
  id: string,
};

export type CreateCloseDateInput = {
  id?: string | null,
  closeDate: string,
  startDate: string,
  endDate: string,
};

export type ModelCloseDateConditionInput = {
  closeDate?: ModelStringInput | null,
  startDate?: ModelStringInput | null,
  endDate?: ModelStringInput | null,
  and?: Array< ModelCloseDateConditionInput | null > | null,
  or?: Array< ModelCloseDateConditionInput | null > | null,
  not?: ModelCloseDateConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CloseDate = {
  __typename: "CloseDate",
  id: string,
  closeDate: string,
  startDate: string,
  endDate: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateCloseDateInput = {
  id: string,
  closeDate?: string | null,
  startDate?: string | null,
  endDate?: string | null,
};

export type DeleteCloseDateInput = {
  id: string,
};

export type CreateAttendanceInput = {
  id?: string | null,
  staffId: string,
  workDate: string,
  startTime?: string | null,
  endTime?: string | null,
  goDirectlyFlag?: boolean | null,
  returnDirectlyFlag?: boolean | null,
  absentFlag?: boolean | null,
  rests?: Array< RestInput | null > | null,
  hourlyPaidHolidayTimes?: Array< HourlyPaidHolidayTimeInput | null > | null,
  remarks?: string | null,
  paidHolidayFlag?: boolean | null,
  specialHolidayFlag?: boolean | null,
  isDeemedHoliday?: boolean | null,
  hourlyPaidHolidayHours?: number | null,
  substituteHolidayDate?: string | null,
  histories?: Array< AttendanceHistoryInput | null > | null,
  changeRequests?: Array< AttendanceChangeRequestInput | null > | null,
  systemComments?: Array< SystemCommentInput | null > | null,
  revision?: number | null,
};

export type RestInput = {
  startTime?: string | null,
  endTime?: string | null,
};

export type HourlyPaidHolidayTimeInput = {
  startTime: string,
  endTime: string,
};

export type AttendanceHistoryInput = {
  staffId: string,
  workDate: string,
  startTime?: string | null,
  endTime?: string | null,
  goDirectlyFlag?: boolean | null,
  absentFlag?: boolean | null,
  returnDirectlyFlag?: boolean | null,
  rests?: Array< RestInput | null > | null,
  hourlyPaidHolidayTimes?: Array< HourlyPaidHolidayTimeInput | null > | null,
  remarks?: string | null,
  paidHolidayFlag?: boolean | null,
  specialHolidayFlag?: boolean | null,
  hourlyPaidHolidayHours?: number | null,
  substituteHolidayFlag?: boolean | null,
  substituteHolidayDate?: string | null,
  createdAt: string,
};

export type AttendanceChangeRequestInput = {
  startTime?: string | null,
  endTime?: string | null,
  goDirectlyFlag?: boolean | null,
  absentFlag?: boolean | null,
  returnDirectlyFlag?: boolean | null,
  rests?: Array< RestInput | null > | null,
  hourlyPaidHolidayTimes?: Array< HourlyPaidHolidayTimeInput | null > | null,
  remarks?: string | null,
  paidHolidayFlag?: boolean | null,
  specialHolidayFlag?: boolean | null,
  hourlyPaidHolidayHours?: number | null,
  substituteHolidayFlag?: boolean | null,
  substituteHolidayDate?: string | null,
  completed?: boolean | null,
  comment?: string | null,
  staffComment?: string | null,
};

export type SystemCommentInput = {
  comment: string,
  confirmed: boolean,
  createdAt: string,
};

export type ModelAttendanceConditionInput = {
  staffId?: ModelStringInput | null,
  workDate?: ModelStringInput | null,
  startTime?: ModelStringInput | null,
  endTime?: ModelStringInput | null,
  goDirectlyFlag?: ModelBooleanInput | null,
  returnDirectlyFlag?: ModelBooleanInput | null,
  absentFlag?: ModelBooleanInput | null,
  remarks?: ModelStringInput | null,
  paidHolidayFlag?: ModelBooleanInput | null,
  specialHolidayFlag?: ModelBooleanInput | null,
  isDeemedHoliday?: ModelBooleanInput | null,
  hourlyPaidHolidayHours?: ModelIntInput | null,
  substituteHolidayDate?: ModelStringInput | null,
  revision?: ModelIntInput | null,
  and?: Array< ModelAttendanceConditionInput | null > | null,
  or?: Array< ModelAttendanceConditionInput | null > | null,
  not?: ModelAttendanceConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Attendance = {
  __typename: "Attendance",
  id: string,
  staffId: string,
  workDate: string,
  startTime?: string | null,
  endTime?: string | null,
  goDirectlyFlag?: boolean | null,
  returnDirectlyFlag?: boolean | null,
  absentFlag?: boolean | null,
  rests?:  Array<Rest | null > | null,
  hourlyPaidHolidayTimes?:  Array<HourlyPaidHolidayTime | null > | null,
  remarks?: string | null,
  paidHolidayFlag?: boolean | null,
  specialHolidayFlag?: boolean | null,
  isDeemedHoliday?: boolean | null,
  hourlyPaidHolidayHours?: number | null,
  substituteHolidayDate?: string | null,
  histories?:  Array<AttendanceHistory | null > | null,
  changeRequests?:  Array<AttendanceChangeRequest | null > | null,
  systemComments?:  Array<SystemComment | null > | null,
  revision?: number | null,
  createdAt: string,
  updatedAt: string,
};

export type Rest = {
  __typename: "Rest",
  startTime?: string | null,
  endTime?: string | null,
};

export type HourlyPaidHolidayTime = {
  __typename: "HourlyPaidHolidayTime",
  startTime: string,
  endTime: string,
};

export type AttendanceHistory = {
  __typename: "AttendanceHistory",
  staffId: string,
  workDate: string,
  startTime?: string | null,
  endTime?: string | null,
  goDirectlyFlag?: boolean | null,
  absentFlag?: boolean | null,
  returnDirectlyFlag?: boolean | null,
  rests?:  Array<Rest | null > | null,
  hourlyPaidHolidayTimes?:  Array<HourlyPaidHolidayTime | null > | null,
  remarks?: string | null,
  paidHolidayFlag?: boolean | null,
  specialHolidayFlag?: boolean | null,
  hourlyPaidHolidayHours?: number | null,
  substituteHolidayFlag?: boolean | null,
  substituteHolidayDate?: string | null,
  createdAt: string,
};

export type AttendanceChangeRequest = {
  __typename: "AttendanceChangeRequest",
  startTime?: string | null,
  endTime?: string | null,
  goDirectlyFlag?: boolean | null,
  absentFlag?: boolean | null,
  returnDirectlyFlag?: boolean | null,
  rests?:  Array<Rest | null > | null,
  hourlyPaidHolidayTimes?:  Array<HourlyPaidHolidayTime | null > | null,
  remarks?: string | null,
  paidHolidayFlag?: boolean | null,
  specialHolidayFlag?: boolean | null,
  hourlyPaidHolidayHours?: number | null,
  substituteHolidayFlag?: boolean | null,
  substituteHolidayDate?: string | null,
  completed?: boolean | null,
  comment?: string | null,
  staffComment?: string | null,
};

export type SystemComment = {
  __typename: "SystemComment",
  comment: string,
  confirmed: boolean,
  createdAt: string,
};

export type UpdateAttendanceInput = {
  id: string,
  staffId?: string | null,
  workDate?: string | null,
  startTime?: string | null,
  endTime?: string | null,
  goDirectlyFlag?: boolean | null,
  returnDirectlyFlag?: boolean | null,
  absentFlag?: boolean | null,
  rests?: Array< RestInput | null > | null,
  hourlyPaidHolidayTimes?: Array< HourlyPaidHolidayTimeInput | null > | null,
  remarks?: string | null,
  paidHolidayFlag?: boolean | null,
  specialHolidayFlag?: boolean | null,
  isDeemedHoliday?: boolean | null,
  hourlyPaidHolidayHours?: number | null,
  substituteHolidayDate?: string | null,
  histories?: Array< AttendanceHistoryInput | null > | null,
  changeRequests?: Array< AttendanceChangeRequestInput | null > | null,
  systemComments?: Array< SystemCommentInput | null > | null,
  revision?: number | null,
};

export type DeleteAttendanceInput = {
  id: string,
};

export type CreateDocumentInput = {
  id?: string | null,
  title: string,
  content: string,
  tag?: Array< string | null > | null,
  targetRole?: Array< string | null > | null,
  revision?: number | null,
};

export type ModelDocumentConditionInput = {
  title?: ModelStringInput | null,
  content?: ModelStringInput | null,
  tag?: ModelStringInput | null,
  targetRole?: ModelStringInput | null,
  revision?: ModelIntInput | null,
  and?: Array< ModelDocumentConditionInput | null > | null,
  or?: Array< ModelDocumentConditionInput | null > | null,
  not?: ModelDocumentConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Document = {
  __typename: "Document",
  id: string,
  title: string,
  content: string,
  tag?: Array< string | null > | null,
  targetRole?: Array< string | null > | null,
  revision?: number | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateDocumentInput = {
  id: string,
  title?: string | null,
  content?: string | null,
  tag?: Array< string | null > | null,
  targetRole?: Array< string | null > | null,
  revision?: number | null,
};

export type DeleteDocumentInput = {
  id: string,
};

export type CreateWorkflowInput = {
  id?: string | null,
  category?: WorkflowCategory | null,
  staffId: string,
  status: WorkflowStatus,
  overTimeDetails?: OverTimeWorkflowInput | null,
  comments?: Array< WorkflowCommentInput | null > | null,
};

export enum WorkflowCategory {
  PAID_LEAVE = "PAID_LEAVE",
  ABSENCE = "ABSENCE",
  OVERTIME = "OVERTIME",
  CUSTOM = "CUSTOM",
}


export enum WorkflowStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}


export type OverTimeWorkflowInput = {
  date: string,
  startTime: string,
  endTime: string,
  reason: string,
};

export type WorkflowCommentInput = {
  id: string,
  staffId: string,
  text: string,
  createdAt: string,
};

export type ModelWorkflowConditionInput = {
  category?: ModelWorkflowCategoryInput | null,
  staffId?: ModelStringInput | null,
  status?: ModelWorkflowStatusInput | null,
  and?: Array< ModelWorkflowConditionInput | null > | null,
  or?: Array< ModelWorkflowConditionInput | null > | null,
  not?: ModelWorkflowConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelWorkflowCategoryInput = {
  eq?: WorkflowCategory | null,
  ne?: WorkflowCategory | null,
};

export type ModelWorkflowStatusInput = {
  eq?: WorkflowStatus | null,
  ne?: WorkflowStatus | null,
};

export type Workflow = {
  __typename: "Workflow",
  id: string,
  category?: WorkflowCategory | null,
  staffId: string,
  status: WorkflowStatus,
  overTimeDetails?: OverTimeWorkflow | null,
  comments?:  Array<WorkflowComment | null > | null,
  createdAt: string,
  updatedAt: string,
};

export type OverTimeWorkflow = {
  __typename: "OverTimeWorkflow",
  date: string,
  startTime: string,
  endTime: string,
  reason: string,
};

export type WorkflowComment = {
  __typename: "WorkflowComment",
  id: string,
  staffId: string,
  text: string,
  createdAt: string,
};

export type UpdateWorkflowInput = {
  id: string,
  category?: WorkflowCategory | null,
  staffId?: string | null,
  status?: WorkflowStatus | null,
  overTimeDetails?: OverTimeWorkflowInput | null,
  comments?: Array< WorkflowCommentInput | null > | null,
};

export type DeleteWorkflowInput = {
  id: string,
};

export type EmailData = {
  to?: Array< string | null > | null,
  subject: string,
  body: string,
};

export type EmailResult = {
  __typename: "EmailResult",
  statusCode?: number | null,
  body?: string | null,
};

export type ModelCheckForUpdateFilterInput = {
  id?: ModelIDInput | null,
  deployUuid?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelCheckForUpdateFilterInput | null > | null,
  or?: Array< ModelCheckForUpdateFilterInput | null > | null,
  not?: ModelCheckForUpdateFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelCheckForUpdateConnection = {
  __typename: "ModelCheckForUpdateConnection",
  items:  Array<CheckForUpdate | null >,
  nextToken?: string | null,
};

export type ModelAppConfigFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  workStartTime?: ModelStringInput | null,
  workEndTime?: ModelStringInput | null,
  lunchRestStartTime?: ModelStringInput | null,
  lunchRestEndTime?: ModelStringInput | null,
  amHolidayStartTime?: ModelStringInput | null,
  amHolidayEndTime?: ModelStringInput | null,
  pmHolidayStartTime?: ModelStringInput | null,
  pmHolidayEndTime?: ModelStringInput | null,
  specialHolidayEnabled?: ModelBooleanInput | null,
  amPmHolidayEnabled?: ModelBooleanInput | null,
  officeMode?: ModelBooleanInput | null,
  absentEnabled?: ModelBooleanInput | null,
  hourlyPaidHolidayEnabled?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelAppConfigFilterInput | null > | null,
  or?: Array< ModelAppConfigFilterInput | null > | null,
  not?: ModelAppConfigFilterInput | null,
};

export type ModelAppConfigConnection = {
  __typename: "ModelAppConfigConnection",
  items:  Array<AppConfig | null >,
  nextToken?: string | null,
};

export type ModelStaffFilterInput = {
  id?: ModelIDInput | null,
  cognitoUserId?: ModelStringInput | null,
  familyName?: ModelStringInput | null,
  givenName?: ModelStringInput | null,
  mailAddress?: ModelStringInput | null,
  role?: ModelStringInput | null,
  enabled?: ModelBooleanInput | null,
  status?: ModelStringInput | null,
  owner?: ModelBooleanInput | null,
  usageStartDate?: ModelStringInput | null,
  sortKey?: ModelStringInput | null,
  workType?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelStaffFilterInput | null > | null,
  or?: Array< ModelStaffFilterInput | null > | null,
  not?: ModelStaffFilterInput | null,
};

export type ModelStaffConnection = {
  __typename: "ModelStaffConnection",
  items:  Array<Staff | null >,
  nextToken?: string | null,
};

export type ModelIDKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelHolidayCalendarFilterInput = {
  id?: ModelIDInput | null,
  holidayDate?: ModelStringInput | null,
  name?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelHolidayCalendarFilterInput | null > | null,
  or?: Array< ModelHolidayCalendarFilterInput | null > | null,
  not?: ModelHolidayCalendarFilterInput | null,
};

export type ModelHolidayCalendarConnection = {
  __typename: "ModelHolidayCalendarConnection",
  items:  Array<HolidayCalendar | null >,
  nextToken?: string | null,
};

export type ModelCompanyHolidayCalendarFilterInput = {
  id?: ModelIDInput | null,
  holidayDate?: ModelStringInput | null,
  name?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelCompanyHolidayCalendarFilterInput | null > | null,
  or?: Array< ModelCompanyHolidayCalendarFilterInput | null > | null,
  not?: ModelCompanyHolidayCalendarFilterInput | null,
};

export type ModelCompanyHolidayCalendarConnection = {
  __typename: "ModelCompanyHolidayCalendarConnection",
  items:  Array<CompanyHolidayCalendar | null >,
  nextToken?: string | null,
};

export type ModelCloseDateFilterInput = {
  id?: ModelIDInput | null,
  closeDate?: ModelStringInput | null,
  startDate?: ModelStringInput | null,
  endDate?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelCloseDateFilterInput | null > | null,
  or?: Array< ModelCloseDateFilterInput | null > | null,
  not?: ModelCloseDateFilterInput | null,
};

export type ModelCloseDateConnection = {
  __typename: "ModelCloseDateConnection",
  items:  Array<CloseDate | null >,
  nextToken?: string | null,
};

export type ModelAttendanceFilterInput = {
  id?: ModelIDInput | null,
  staffId?: ModelStringInput | null,
  workDate?: ModelStringInput | null,
  startTime?: ModelStringInput | null,
  endTime?: ModelStringInput | null,
  goDirectlyFlag?: ModelBooleanInput | null,
  returnDirectlyFlag?: ModelBooleanInput | null,
  absentFlag?: ModelBooleanInput | null,
  remarks?: ModelStringInput | null,
  paidHolidayFlag?: ModelBooleanInput | null,
  specialHolidayFlag?: ModelBooleanInput | null,
  isDeemedHoliday?: ModelBooleanInput | null,
  hourlyPaidHolidayHours?: ModelIntInput | null,
  substituteHolidayDate?: ModelStringInput | null,
  revision?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelAttendanceFilterInput | null > | null,
  or?: Array< ModelAttendanceFilterInput | null > | null,
  not?: ModelAttendanceFilterInput | null,
};

export type ModelAttendanceConnection = {
  __typename: "ModelAttendanceConnection",
  items:  Array<Attendance | null >,
  nextToken?: string | null,
};

export type ModelStringKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type ModelDocumentFilterInput = {
  id?: ModelIDInput | null,
  title?: ModelStringInput | null,
  content?: ModelStringInput | null,
  tag?: ModelStringInput | null,
  targetRole?: ModelStringInput | null,
  revision?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelDocumentFilterInput | null > | null,
  or?: Array< ModelDocumentFilterInput | null > | null,
  not?: ModelDocumentFilterInput | null,
};

export type ModelDocumentConnection = {
  __typename: "ModelDocumentConnection",
  items:  Array<Document | null >,
  nextToken?: string | null,
};

export type ModelWorkflowFilterInput = {
  id?: ModelIDInput | null,
  category?: ModelWorkflowCategoryInput | null,
  staffId?: ModelStringInput | null,
  status?: ModelWorkflowStatusInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelWorkflowFilterInput | null > | null,
  or?: Array< ModelWorkflowFilterInput | null > | null,
  not?: ModelWorkflowFilterInput | null,
};

export type ModelWorkflowConnection = {
  __typename: "ModelWorkflowConnection",
  items:  Array<Workflow | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionCheckForUpdateFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  deployUuid?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionCheckForUpdateFilterInput | null > | null,
  or?: Array< ModelSubscriptionCheckForUpdateFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionAppConfigFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  workStartTime?: ModelSubscriptionStringInput | null,
  workEndTime?: ModelSubscriptionStringInput | null,
  lunchRestStartTime?: ModelSubscriptionStringInput | null,
  lunchRestEndTime?: ModelSubscriptionStringInput | null,
  amHolidayStartTime?: ModelSubscriptionStringInput | null,
  amHolidayEndTime?: ModelSubscriptionStringInput | null,
  pmHolidayStartTime?: ModelSubscriptionStringInput | null,
  pmHolidayEndTime?: ModelSubscriptionStringInput | null,
  specialHolidayEnabled?: ModelSubscriptionBooleanInput | null,
  amPmHolidayEnabled?: ModelSubscriptionBooleanInput | null,
  officeMode?: ModelSubscriptionBooleanInput | null,
  absentEnabled?: ModelSubscriptionBooleanInput | null,
  hourlyPaidHolidayEnabled?: ModelSubscriptionBooleanInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionAppConfigFilterInput | null > | null,
  or?: Array< ModelSubscriptionAppConfigFilterInput | null > | null,
};

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionStaffFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  cognitoUserId?: ModelSubscriptionStringInput | null,
  familyName?: ModelSubscriptionStringInput | null,
  givenName?: ModelSubscriptionStringInput | null,
  mailAddress?: ModelSubscriptionStringInput | null,
  role?: ModelSubscriptionStringInput | null,
  enabled?: ModelSubscriptionBooleanInput | null,
  status?: ModelSubscriptionStringInput | null,
  owner?: ModelSubscriptionBooleanInput | null,
  usageStartDate?: ModelSubscriptionStringInput | null,
  sortKey?: ModelSubscriptionStringInput | null,
  workType?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionStaffFilterInput | null > | null,
  or?: Array< ModelSubscriptionStaffFilterInput | null > | null,
};

export type ModelSubscriptionHolidayCalendarFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  holidayDate?: ModelSubscriptionStringInput | null,
  name?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionHolidayCalendarFilterInput | null > | null,
  or?: Array< ModelSubscriptionHolidayCalendarFilterInput | null > | null,
};

export type ModelSubscriptionCompanyHolidayCalendarFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  holidayDate?: ModelSubscriptionStringInput | null,
  name?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionCompanyHolidayCalendarFilterInput | null > | null,
  or?: Array< ModelSubscriptionCompanyHolidayCalendarFilterInput | null > | null,
};

export type ModelSubscriptionCloseDateFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  closeDate?: ModelSubscriptionStringInput | null,
  startDate?: ModelSubscriptionStringInput | null,
  endDate?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionCloseDateFilterInput | null > | null,
  or?: Array< ModelSubscriptionCloseDateFilterInput | null > | null,
};

export type ModelSubscriptionAttendanceFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  staffId?: ModelSubscriptionStringInput | null,
  workDate?: ModelSubscriptionStringInput | null,
  startTime?: ModelSubscriptionStringInput | null,
  endTime?: ModelSubscriptionStringInput | null,
  goDirectlyFlag?: ModelSubscriptionBooleanInput | null,
  returnDirectlyFlag?: ModelSubscriptionBooleanInput | null,
  absentFlag?: ModelSubscriptionBooleanInput | null,
  remarks?: ModelSubscriptionStringInput | null,
  paidHolidayFlag?: ModelSubscriptionBooleanInput | null,
  specialHolidayFlag?: ModelSubscriptionBooleanInput | null,
  isDeemedHoliday?: ModelSubscriptionBooleanInput | null,
  hourlyPaidHolidayHours?: ModelSubscriptionIntInput | null,
  substituteHolidayDate?: ModelSubscriptionStringInput | null,
  revision?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionAttendanceFilterInput | null > | null,
  or?: Array< ModelSubscriptionAttendanceFilterInput | null > | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionDocumentFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  title?: ModelSubscriptionStringInput | null,
  content?: ModelSubscriptionStringInput | null,
  tag?: ModelSubscriptionStringInput | null,
  targetRole?: ModelSubscriptionStringInput | null,
  revision?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionDocumentFilterInput | null > | null,
  or?: Array< ModelSubscriptionDocumentFilterInput | null > | null,
};

export type ModelSubscriptionWorkflowFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  category?: ModelSubscriptionStringInput | null,
  staffId?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionWorkflowFilterInput | null > | null,
  or?: Array< ModelSubscriptionWorkflowFilterInput | null > | null,
};

export type CreateCheckForUpdateMutationVariables = {
  input: CreateCheckForUpdateInput,
  condition?: ModelCheckForUpdateConditionInput | null,
};

export type CreateCheckForUpdateMutation = {
  createCheckForUpdate?:  {
    __typename: "CheckForUpdate",
    id: string,
    deployUuid: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateCheckForUpdateMutationVariables = {
  input: UpdateCheckForUpdateInput,
  condition?: ModelCheckForUpdateConditionInput | null,
};

export type UpdateCheckForUpdateMutation = {
  updateCheckForUpdate?:  {
    __typename: "CheckForUpdate",
    id: string,
    deployUuid: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteCheckForUpdateMutationVariables = {
  input: DeleteCheckForUpdateInput,
  condition?: ModelCheckForUpdateConditionInput | null,
};

export type DeleteCheckForUpdateMutation = {
  deleteCheckForUpdate?:  {
    __typename: "CheckForUpdate",
    id: string,
    deployUuid: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateAppConfigMutationVariables = {
  input: CreateAppConfigInput,
  condition?: ModelAppConfigConditionInput | null,
};

export type CreateAppConfigMutation = {
  createAppConfig?:  {
    __typename: "AppConfig",
    id: string,
    name: string,
    workStartTime?: string | null,
    workEndTime?: string | null,
    lunchRestStartTime?: string | null,
    lunchRestEndTime?: string | null,
    amHolidayStartTime?: string | null,
    amHolidayEndTime?: string | null,
    pmHolidayStartTime?: string | null,
    pmHolidayEndTime?: string | null,
    specialHolidayEnabled?: boolean | null,
    amPmHolidayEnabled?: boolean | null,
    officeMode?: boolean | null,
    absentEnabled?: boolean | null,
    hourlyPaidHolidayEnabled?: boolean | null,
    links?:  Array< {
      __typename: "Link",
      label: string,
      url: string,
      enabled: boolean,
      icon?: string | null,
    } | null > | null,
    reasons?:  Array< {
      __typename: "Reason",
      reason: string,
      enabled: boolean,
    } | null > | null,
    quickInputStartTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    quickInputEndTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateAppConfigMutationVariables = {
  input: UpdateAppConfigInput,
  condition?: ModelAppConfigConditionInput | null,
};

export type UpdateAppConfigMutation = {
  updateAppConfig?:  {
    __typename: "AppConfig",
    id: string,
    name: string,
    workStartTime?: string | null,
    workEndTime?: string | null,
    lunchRestStartTime?: string | null,
    lunchRestEndTime?: string | null,
    amHolidayStartTime?: string | null,
    amHolidayEndTime?: string | null,
    pmHolidayStartTime?: string | null,
    pmHolidayEndTime?: string | null,
    specialHolidayEnabled?: boolean | null,
    amPmHolidayEnabled?: boolean | null,
    officeMode?: boolean | null,
    absentEnabled?: boolean | null,
    hourlyPaidHolidayEnabled?: boolean | null,
    links?:  Array< {
      __typename: "Link",
      label: string,
      url: string,
      enabled: boolean,
      icon?: string | null,
    } | null > | null,
    reasons?:  Array< {
      __typename: "Reason",
      reason: string,
      enabled: boolean,
    } | null > | null,
    quickInputStartTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    quickInputEndTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteAppConfigMutationVariables = {
  input: DeleteAppConfigInput,
  condition?: ModelAppConfigConditionInput | null,
};

export type DeleteAppConfigMutation = {
  deleteAppConfig?:  {
    __typename: "AppConfig",
    id: string,
    name: string,
    workStartTime?: string | null,
    workEndTime?: string | null,
    lunchRestStartTime?: string | null,
    lunchRestEndTime?: string | null,
    amHolidayStartTime?: string | null,
    amHolidayEndTime?: string | null,
    pmHolidayStartTime?: string | null,
    pmHolidayEndTime?: string | null,
    specialHolidayEnabled?: boolean | null,
    amPmHolidayEnabled?: boolean | null,
    officeMode?: boolean | null,
    absentEnabled?: boolean | null,
    hourlyPaidHolidayEnabled?: boolean | null,
    links?:  Array< {
      __typename: "Link",
      label: string,
      url: string,
      enabled: boolean,
      icon?: string | null,
    } | null > | null,
    reasons?:  Array< {
      __typename: "Reason",
      reason: string,
      enabled: boolean,
    } | null > | null,
    quickInputStartTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    quickInputEndTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateStaffMutationVariables = {
  input: CreateStaffInput,
  condition?: ModelStaffConditionInput | null,
};

export type CreateStaffMutation = {
  createStaff?:  {
    __typename: "Staff",
    id: string,
    cognitoUserId: string,
    familyName?: string | null,
    givenName?: string | null,
    mailAddress: string,
    role: string,
    enabled: boolean,
    status: string,
    owner?: boolean | null,
    usageStartDate?: string | null,
    notifications?:  {
      __typename: "Notification",
      workStart?: boolean | null,
      workEnd?: boolean | null,
    } | null,
    sortKey?: string | null,
    workType?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateStaffMutationVariables = {
  input: UpdateStaffInput,
  condition?: ModelStaffConditionInput | null,
};

export type UpdateStaffMutation = {
  updateStaff?:  {
    __typename: "Staff",
    id: string,
    cognitoUserId: string,
    familyName?: string | null,
    givenName?: string | null,
    mailAddress: string,
    role: string,
    enabled: boolean,
    status: string,
    owner?: boolean | null,
    usageStartDate?: string | null,
    notifications?:  {
      __typename: "Notification",
      workStart?: boolean | null,
      workEnd?: boolean | null,
    } | null,
    sortKey?: string | null,
    workType?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteStaffMutationVariables = {
  input: DeleteStaffInput,
  condition?: ModelStaffConditionInput | null,
};

export type DeleteStaffMutation = {
  deleteStaff?:  {
    __typename: "Staff",
    id: string,
    cognitoUserId: string,
    familyName?: string | null,
    givenName?: string | null,
    mailAddress: string,
    role: string,
    enabled: boolean,
    status: string,
    owner?: boolean | null,
    usageStartDate?: string | null,
    notifications?:  {
      __typename: "Notification",
      workStart?: boolean | null,
      workEnd?: boolean | null,
    } | null,
    sortKey?: string | null,
    workType?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateHolidayCalendarMutationVariables = {
  input: CreateHolidayCalendarInput,
  condition?: ModelHolidayCalendarConditionInput | null,
};

export type CreateHolidayCalendarMutation = {
  createHolidayCalendar?:  {
    __typename: "HolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateHolidayCalendarMutationVariables = {
  input: UpdateHolidayCalendarInput,
  condition?: ModelHolidayCalendarConditionInput | null,
};

export type UpdateHolidayCalendarMutation = {
  updateHolidayCalendar?:  {
    __typename: "HolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteHolidayCalendarMutationVariables = {
  input: DeleteHolidayCalendarInput,
  condition?: ModelHolidayCalendarConditionInput | null,
};

export type DeleteHolidayCalendarMutation = {
  deleteHolidayCalendar?:  {
    __typename: "HolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateCompanyHolidayCalendarMutationVariables = {
  input: CreateCompanyHolidayCalendarInput,
  condition?: ModelCompanyHolidayCalendarConditionInput | null,
};

export type CreateCompanyHolidayCalendarMutation = {
  createCompanyHolidayCalendar?:  {
    __typename: "CompanyHolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateCompanyHolidayCalendarMutationVariables = {
  input: UpdateCompanyHolidayCalendarInput,
  condition?: ModelCompanyHolidayCalendarConditionInput | null,
};

export type UpdateCompanyHolidayCalendarMutation = {
  updateCompanyHolidayCalendar?:  {
    __typename: "CompanyHolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteCompanyHolidayCalendarMutationVariables = {
  input: DeleteCompanyHolidayCalendarInput,
  condition?: ModelCompanyHolidayCalendarConditionInput | null,
};

export type DeleteCompanyHolidayCalendarMutation = {
  deleteCompanyHolidayCalendar?:  {
    __typename: "CompanyHolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateCloseDateMutationVariables = {
  input: CreateCloseDateInput,
  condition?: ModelCloseDateConditionInput | null,
};

export type CreateCloseDateMutation = {
  createCloseDate?:  {
    __typename: "CloseDate",
    id: string,
    closeDate: string,
    startDate: string,
    endDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateCloseDateMutationVariables = {
  input: UpdateCloseDateInput,
  condition?: ModelCloseDateConditionInput | null,
};

export type UpdateCloseDateMutation = {
  updateCloseDate?:  {
    __typename: "CloseDate",
    id: string,
    closeDate: string,
    startDate: string,
    endDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteCloseDateMutationVariables = {
  input: DeleteCloseDateInput,
  condition?: ModelCloseDateConditionInput | null,
};

export type DeleteCloseDateMutation = {
  deleteCloseDate?:  {
    __typename: "CloseDate",
    id: string,
    closeDate: string,
    startDate: string,
    endDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateAttendanceMutationVariables = {
  input: CreateAttendanceInput,
  condition?: ModelAttendanceConditionInput | null,
};

export type CreateAttendanceMutation = {
  createAttendance?:  {
    __typename: "Attendance",
    id: string,
    staffId: string,
    workDate: string,
    startTime?: string | null,
    endTime?: string | null,
    goDirectlyFlag?: boolean | null,
    returnDirectlyFlag?: boolean | null,
    absentFlag?: boolean | null,
    rests?:  Array< {
      __typename: "Rest",
      startTime?: string | null,
      endTime?: string | null,
    } | null > | null,
    hourlyPaidHolidayTimes?:  Array< {
      __typename: "HourlyPaidHolidayTime",
      startTime: string,
      endTime: string,
    } | null > | null,
    remarks?: string | null,
    paidHolidayFlag?: boolean | null,
    specialHolidayFlag?: boolean | null,
    isDeemedHoliday?: boolean | null,
    hourlyPaidHolidayHours?: number | null,
    substituteHolidayDate?: string | null,
    histories?:  Array< {
      __typename: "AttendanceHistory",
      staffId: string,
      workDate: string,
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      createdAt: string,
    } | null > | null,
    changeRequests?:  Array< {
      __typename: "AttendanceChangeRequest",
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      completed?: boolean | null,
      comment?: string | null,
      staffComment?: string | null,
    } | null > | null,
    systemComments?:  Array< {
      __typename: "SystemComment",
      comment: string,
      confirmed: boolean,
      createdAt: string,
    } | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateAttendanceMutationVariables = {
  input: UpdateAttendanceInput,
  condition?: ModelAttendanceConditionInput | null,
};

export type UpdateAttendanceMutation = {
  updateAttendance?:  {
    __typename: "Attendance",
    id: string,
    staffId: string,
    workDate: string,
    startTime?: string | null,
    endTime?: string | null,
    goDirectlyFlag?: boolean | null,
    returnDirectlyFlag?: boolean | null,
    absentFlag?: boolean | null,
    rests?:  Array< {
      __typename: "Rest",
      startTime?: string | null,
      endTime?: string | null,
    } | null > | null,
    hourlyPaidHolidayTimes?:  Array< {
      __typename: "HourlyPaidHolidayTime",
      startTime: string,
      endTime: string,
    } | null > | null,
    remarks?: string | null,
    paidHolidayFlag?: boolean | null,
    specialHolidayFlag?: boolean | null,
    isDeemedHoliday?: boolean | null,
    hourlyPaidHolidayHours?: number | null,
    substituteHolidayDate?: string | null,
    histories?:  Array< {
      __typename: "AttendanceHistory",
      staffId: string,
      workDate: string,
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      createdAt: string,
    } | null > | null,
    changeRequests?:  Array< {
      __typename: "AttendanceChangeRequest",
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      completed?: boolean | null,
      comment?: string | null,
      staffComment?: string | null,
    } | null > | null,
    systemComments?:  Array< {
      __typename: "SystemComment",
      comment: string,
      confirmed: boolean,
      createdAt: string,
    } | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteAttendanceMutationVariables = {
  input: DeleteAttendanceInput,
  condition?: ModelAttendanceConditionInput | null,
};

export type DeleteAttendanceMutation = {
  deleteAttendance?:  {
    __typename: "Attendance",
    id: string,
    staffId: string,
    workDate: string,
    startTime?: string | null,
    endTime?: string | null,
    goDirectlyFlag?: boolean | null,
    returnDirectlyFlag?: boolean | null,
    absentFlag?: boolean | null,
    rests?:  Array< {
      __typename: "Rest",
      startTime?: string | null,
      endTime?: string | null,
    } | null > | null,
    hourlyPaidHolidayTimes?:  Array< {
      __typename: "HourlyPaidHolidayTime",
      startTime: string,
      endTime: string,
    } | null > | null,
    remarks?: string | null,
    paidHolidayFlag?: boolean | null,
    specialHolidayFlag?: boolean | null,
    isDeemedHoliday?: boolean | null,
    hourlyPaidHolidayHours?: number | null,
    substituteHolidayDate?: string | null,
    histories?:  Array< {
      __typename: "AttendanceHistory",
      staffId: string,
      workDate: string,
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      createdAt: string,
    } | null > | null,
    changeRequests?:  Array< {
      __typename: "AttendanceChangeRequest",
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      completed?: boolean | null,
      comment?: string | null,
      staffComment?: string | null,
    } | null > | null,
    systemComments?:  Array< {
      __typename: "SystemComment",
      comment: string,
      confirmed: boolean,
      createdAt: string,
    } | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateDocumentMutationVariables = {
  input: CreateDocumentInput,
  condition?: ModelDocumentConditionInput | null,
};

export type CreateDocumentMutation = {
  createDocument?:  {
    __typename: "Document",
    id: string,
    title: string,
    content: string,
    tag?: Array< string | null > | null,
    targetRole?: Array< string | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateDocumentMutationVariables = {
  input: UpdateDocumentInput,
  condition?: ModelDocumentConditionInput | null,
};

export type UpdateDocumentMutation = {
  updateDocument?:  {
    __typename: "Document",
    id: string,
    title: string,
    content: string,
    tag?: Array< string | null > | null,
    targetRole?: Array< string | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteDocumentMutationVariables = {
  input: DeleteDocumentInput,
  condition?: ModelDocumentConditionInput | null,
};

export type DeleteDocumentMutation = {
  deleteDocument?:  {
    __typename: "Document",
    id: string,
    title: string,
    content: string,
    tag?: Array< string | null > | null,
    targetRole?: Array< string | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateWorkflowMutationVariables = {
  input: CreateWorkflowInput,
  condition?: ModelWorkflowConditionInput | null,
};

export type CreateWorkflowMutation = {
  createWorkflow?:  {
    __typename: "Workflow",
    id: string,
    category?: WorkflowCategory | null,
    staffId: string,
    status: WorkflowStatus,
    overTimeDetails?:  {
      __typename: "OverTimeWorkflow",
      date: string,
      startTime: string,
      endTime: string,
      reason: string,
    } | null,
    comments?:  Array< {
      __typename: "WorkflowComment",
      id: string,
      staffId: string,
      text: string,
      createdAt: string,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateWorkflowMutationVariables = {
  input: UpdateWorkflowInput,
  condition?: ModelWorkflowConditionInput | null,
};

export type UpdateWorkflowMutation = {
  updateWorkflow?:  {
    __typename: "Workflow",
    id: string,
    category?: WorkflowCategory | null,
    staffId: string,
    status: WorkflowStatus,
    overTimeDetails?:  {
      __typename: "OverTimeWorkflow",
      date: string,
      startTime: string,
      endTime: string,
      reason: string,
    } | null,
    comments?:  Array< {
      __typename: "WorkflowComment",
      id: string,
      staffId: string,
      text: string,
      createdAt: string,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteWorkflowMutationVariables = {
  input: DeleteWorkflowInput,
  condition?: ModelWorkflowConditionInput | null,
};

export type DeleteWorkflowMutation = {
  deleteWorkflow?:  {
    __typename: "Workflow",
    id: string,
    category?: WorkflowCategory | null,
    staffId: string,
    status: WorkflowStatus,
    overTimeDetails?:  {
      __typename: "OverTimeWorkflow",
      date: string,
      startTime: string,
      endTime: string,
      reason: string,
    } | null,
    comments?:  Array< {
      __typename: "WorkflowComment",
      id: string,
      staffId: string,
      text: string,
      createdAt: string,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type SendMailQueryVariables = {
  data: EmailData,
};

export type SendMailQuery = {
  sendMail?:  {
    __typename: "EmailResult",
    statusCode?: number | null,
    body?: string | null,
  } | null,
};

export type GetCheckForUpdateQueryVariables = {
  id: string,
};

export type GetCheckForUpdateQuery = {
  getCheckForUpdate?:  {
    __typename: "CheckForUpdate",
    id: string,
    deployUuid: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListCheckForUpdatesQueryVariables = {
  filter?: ModelCheckForUpdateFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCheckForUpdatesQuery = {
  listCheckForUpdates?:  {
    __typename: "ModelCheckForUpdateConnection",
    items:  Array< {
      __typename: "CheckForUpdate",
      id: string,
      deployUuid: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetAppConfigQueryVariables = {
  id: string,
};

export type GetAppConfigQuery = {
  getAppConfig?:  {
    __typename: "AppConfig",
    id: string,
    name: string,
    workStartTime?: string | null,
    workEndTime?: string | null,
    lunchRestStartTime?: string | null,
    lunchRestEndTime?: string | null,
    amHolidayStartTime?: string | null,
    amHolidayEndTime?: string | null,
    pmHolidayStartTime?: string | null,
    pmHolidayEndTime?: string | null,
    specialHolidayEnabled?: boolean | null,
    amPmHolidayEnabled?: boolean | null,
    officeMode?: boolean | null,
    absentEnabled?: boolean | null,
    hourlyPaidHolidayEnabled?: boolean | null,
    links?:  Array< {
      __typename: "Link",
      label: string,
      url: string,
      enabled: boolean,
      icon?: string | null,
    } | null > | null,
    reasons?:  Array< {
      __typename: "Reason",
      reason: string,
      enabled: boolean,
    } | null > | null,
    quickInputStartTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    quickInputEndTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListAppConfigsQueryVariables = {
  filter?: ModelAppConfigFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListAppConfigsQuery = {
  listAppConfigs?:  {
    __typename: "ModelAppConfigConnection",
    items:  Array< {
      __typename: "AppConfig",
      id: string,
      name: string,
      workStartTime?: string | null,
      workEndTime?: string | null,
      lunchRestStartTime?: string | null,
      lunchRestEndTime?: string | null,
      amHolidayStartTime?: string | null,
      amHolidayEndTime?: string | null,
      pmHolidayStartTime?: string | null,
      pmHolidayEndTime?: string | null,
      specialHolidayEnabled?: boolean | null,
      amPmHolidayEnabled?: boolean | null,
      officeMode?: boolean | null,
      absentEnabled?: boolean | null,
      hourlyPaidHolidayEnabled?: boolean | null,
      links?:  Array< {
        __typename: "Link",
        label: string,
        url: string,
        enabled: boolean,
        icon?: string | null,
      } | null > | null,
      reasons?:  Array< {
        __typename: "Reason",
        reason: string,
        enabled: boolean,
      } | null > | null,
      quickInputStartTimes?:  Array< {
        __typename: "QuickInputTime",
        time: string,
        enabled: boolean,
      } | null > | null,
      quickInputEndTimes?:  Array< {
        __typename: "QuickInputTime",
        time: string,
        enabled: boolean,
      } | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetStaffQueryVariables = {
  id: string,
};

export type GetStaffQuery = {
  getStaff?:  {
    __typename: "Staff",
    id: string,
    cognitoUserId: string,
    familyName?: string | null,
    givenName?: string | null,
    mailAddress: string,
    role: string,
    enabled: boolean,
    status: string,
    owner?: boolean | null,
    usageStartDate?: string | null,
    notifications?:  {
      __typename: "Notification",
      workStart?: boolean | null,
      workEnd?: boolean | null,
    } | null,
    sortKey?: string | null,
    workType?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListStaffQueryVariables = {
  filter?: ModelStaffFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListStaffQuery = {
  listStaff?:  {
    __typename: "ModelStaffConnection",
    items:  Array< {
      __typename: "Staff",
      id: string,
      cognitoUserId: string,
      familyName?: string | null,
      givenName?: string | null,
      mailAddress: string,
      role: string,
      enabled: boolean,
      status: string,
      owner?: boolean | null,
      usageStartDate?: string | null,
      notifications?:  {
        __typename: "Notification",
        workStart?: boolean | null,
        workEnd?: boolean | null,
      } | null,
      sortKey?: string | null,
      workType?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type StaffByCognitoUserIdQueryVariables = {
  cognitoUserId: string,
  id?: ModelIDKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelStaffFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type StaffByCognitoUserIdQuery = {
  staffByCognitoUserId?:  {
    __typename: "ModelStaffConnection",
    items:  Array< {
      __typename: "Staff",
      id: string,
      cognitoUserId: string,
      familyName?: string | null,
      givenName?: string | null,
      mailAddress: string,
      role: string,
      enabled: boolean,
      status: string,
      owner?: boolean | null,
      usageStartDate?: string | null,
      notifications?:  {
        __typename: "Notification",
        workStart?: boolean | null,
        workEnd?: boolean | null,
      } | null,
      sortKey?: string | null,
      workType?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetHolidayCalendarQueryVariables = {
  id: string,
};

export type GetHolidayCalendarQuery = {
  getHolidayCalendar?:  {
    __typename: "HolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListHolidayCalendarsQueryVariables = {
  filter?: ModelHolidayCalendarFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListHolidayCalendarsQuery = {
  listHolidayCalendars?:  {
    __typename: "ModelHolidayCalendarConnection",
    items:  Array< {
      __typename: "HolidayCalendar",
      id: string,
      holidayDate: string,
      name: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetCompanyHolidayCalendarQueryVariables = {
  id: string,
};

export type GetCompanyHolidayCalendarQuery = {
  getCompanyHolidayCalendar?:  {
    __typename: "CompanyHolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListCompanyHolidayCalendarsQueryVariables = {
  filter?: ModelCompanyHolidayCalendarFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCompanyHolidayCalendarsQuery = {
  listCompanyHolidayCalendars?:  {
    __typename: "ModelCompanyHolidayCalendarConnection",
    items:  Array< {
      __typename: "CompanyHolidayCalendar",
      id: string,
      holidayDate: string,
      name: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetCloseDateQueryVariables = {
  id: string,
};

export type GetCloseDateQuery = {
  getCloseDate?:  {
    __typename: "CloseDate",
    id: string,
    closeDate: string,
    startDate: string,
    endDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListCloseDatesQueryVariables = {
  filter?: ModelCloseDateFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCloseDatesQuery = {
  listCloseDates?:  {
    __typename: "ModelCloseDateConnection",
    items:  Array< {
      __typename: "CloseDate",
      id: string,
      closeDate: string,
      startDate: string,
      endDate: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetAttendanceQueryVariables = {
  id: string,
};

export type GetAttendanceQuery = {
  getAttendance?:  {
    __typename: "Attendance",
    id: string,
    staffId: string,
    workDate: string,
    startTime?: string | null,
    endTime?: string | null,
    goDirectlyFlag?: boolean | null,
    returnDirectlyFlag?: boolean | null,
    absentFlag?: boolean | null,
    rests?:  Array< {
      __typename: "Rest",
      startTime?: string | null,
      endTime?: string | null,
    } | null > | null,
    hourlyPaidHolidayTimes?:  Array< {
      __typename: "HourlyPaidHolidayTime",
      startTime: string,
      endTime: string,
    } | null > | null,
    remarks?: string | null,
    paidHolidayFlag?: boolean | null,
    specialHolidayFlag?: boolean | null,
    isDeemedHoliday?: boolean | null,
    hourlyPaidHolidayHours?: number | null,
    substituteHolidayDate?: string | null,
    histories?:  Array< {
      __typename: "AttendanceHistory",
      staffId: string,
      workDate: string,
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      createdAt: string,
    } | null > | null,
    changeRequests?:  Array< {
      __typename: "AttendanceChangeRequest",
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      completed?: boolean | null,
      comment?: string | null,
      staffComment?: string | null,
    } | null > | null,
    systemComments?:  Array< {
      __typename: "SystemComment",
      comment: string,
      confirmed: boolean,
      createdAt: string,
    } | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListAttendancesQueryVariables = {
  filter?: ModelAttendanceFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListAttendancesQuery = {
  listAttendances?:  {
    __typename: "ModelAttendanceConnection",
    items:  Array< {
      __typename: "Attendance",
      id: string,
      staffId: string,
      workDate: string,
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      isDeemedHoliday?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayDate?: string | null,
      histories?:  Array< {
        __typename: "AttendanceHistory",
        staffId: string,
        workDate: string,
        startTime?: string | null,
        endTime?: string | null,
        goDirectlyFlag?: boolean | null,
        absentFlag?: boolean | null,
        returnDirectlyFlag?: boolean | null,
        rests?:  Array< {
          __typename: "Rest",
          startTime?: string | null,
          endTime?: string | null,
        } | null > | null,
        hourlyPaidHolidayTimes?:  Array< {
          __typename: "HourlyPaidHolidayTime",
          startTime: string,
          endTime: string,
        } | null > | null,
        remarks?: string | null,
        paidHolidayFlag?: boolean | null,
        specialHolidayFlag?: boolean | null,
        hourlyPaidHolidayHours?: number | null,
        substituteHolidayFlag?: boolean | null,
        substituteHolidayDate?: string | null,
        createdAt: string,
      } | null > | null,
      changeRequests?:  Array< {
        __typename: "AttendanceChangeRequest",
        startTime?: string | null,
        endTime?: string | null,
        goDirectlyFlag?: boolean | null,
        absentFlag?: boolean | null,
        returnDirectlyFlag?: boolean | null,
        rests?:  Array< {
          __typename: "Rest",
          startTime?: string | null,
          endTime?: string | null,
        } | null > | null,
        hourlyPaidHolidayTimes?:  Array< {
          __typename: "HourlyPaidHolidayTime",
          startTime: string,
          endTime: string,
        } | null > | null,
        remarks?: string | null,
        paidHolidayFlag?: boolean | null,
        specialHolidayFlag?: boolean | null,
        hourlyPaidHolidayHours?: number | null,
        substituteHolidayFlag?: boolean | null,
        substituteHolidayDate?: string | null,
        completed?: boolean | null,
        comment?: string | null,
        staffComment?: string | null,
      } | null > | null,
      systemComments?:  Array< {
        __typename: "SystemComment",
        comment: string,
        confirmed: boolean,
        createdAt: string,
      } | null > | null,
      revision?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type AttendancesByStaffIdQueryVariables = {
  staffId: string,
  workDate?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelAttendanceFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type AttendancesByStaffIdQuery = {
  attendancesByStaffId?:  {
    __typename: "ModelAttendanceConnection",
    items:  Array< {
      __typename: "Attendance",
      id: string,
      staffId: string,
      workDate: string,
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      isDeemedHoliday?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayDate?: string | null,
      histories?:  Array< {
        __typename: "AttendanceHistory",
        staffId: string,
        workDate: string,
        startTime?: string | null,
        endTime?: string | null,
        goDirectlyFlag?: boolean | null,
        absentFlag?: boolean | null,
        returnDirectlyFlag?: boolean | null,
        rests?:  Array< {
          __typename: "Rest",
          startTime?: string | null,
          endTime?: string | null,
        } | null > | null,
        hourlyPaidHolidayTimes?:  Array< {
          __typename: "HourlyPaidHolidayTime",
          startTime: string,
          endTime: string,
        } | null > | null,
        remarks?: string | null,
        paidHolidayFlag?: boolean | null,
        specialHolidayFlag?: boolean | null,
        hourlyPaidHolidayHours?: number | null,
        substituteHolidayFlag?: boolean | null,
        substituteHolidayDate?: string | null,
        createdAt: string,
      } | null > | null,
      changeRequests?:  Array< {
        __typename: "AttendanceChangeRequest",
        startTime?: string | null,
        endTime?: string | null,
        goDirectlyFlag?: boolean | null,
        absentFlag?: boolean | null,
        returnDirectlyFlag?: boolean | null,
        rests?:  Array< {
          __typename: "Rest",
          startTime?: string | null,
          endTime?: string | null,
        } | null > | null,
        hourlyPaidHolidayTimes?:  Array< {
          __typename: "HourlyPaidHolidayTime",
          startTime: string,
          endTime: string,
        } | null > | null,
        remarks?: string | null,
        paidHolidayFlag?: boolean | null,
        specialHolidayFlag?: boolean | null,
        hourlyPaidHolidayHours?: number | null,
        substituteHolidayFlag?: boolean | null,
        substituteHolidayDate?: string | null,
        completed?: boolean | null,
        comment?: string | null,
        staffComment?: string | null,
      } | null > | null,
      systemComments?:  Array< {
        __typename: "SystemComment",
        comment: string,
        confirmed: boolean,
        createdAt: string,
      } | null > | null,
      revision?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetDocumentQueryVariables = {
  id: string,
};

export type GetDocumentQuery = {
  getDocument?:  {
    __typename: "Document",
    id: string,
    title: string,
    content: string,
    tag?: Array< string | null > | null,
    targetRole?: Array< string | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListDocumentsQueryVariables = {
  filter?: ModelDocumentFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListDocumentsQuery = {
  listDocuments?:  {
    __typename: "ModelDocumentConnection",
    items:  Array< {
      __typename: "Document",
      id: string,
      title: string,
      content: string,
      tag?: Array< string | null > | null,
      targetRole?: Array< string | null > | null,
      revision?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetWorkflowQueryVariables = {
  id: string,
};

export type GetWorkflowQuery = {
  getWorkflow?:  {
    __typename: "Workflow",
    id: string,
    category?: WorkflowCategory | null,
    staffId: string,
    status: WorkflowStatus,
    overTimeDetails?:  {
      __typename: "OverTimeWorkflow",
      date: string,
      startTime: string,
      endTime: string,
      reason: string,
    } | null,
    comments?:  Array< {
      __typename: "WorkflowComment",
      id: string,
      staffId: string,
      text: string,
      createdAt: string,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListWorkflowsQueryVariables = {
  filter?: ModelWorkflowFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListWorkflowsQuery = {
  listWorkflows?:  {
    __typename: "ModelWorkflowConnection",
    items:  Array< {
      __typename: "Workflow",
      id: string,
      category?: WorkflowCategory | null,
      staffId: string,
      status: WorkflowStatus,
      overTimeDetails?:  {
        __typename: "OverTimeWorkflow",
        date: string,
        startTime: string,
        endTime: string,
        reason: string,
      } | null,
      comments?:  Array< {
        __typename: "WorkflowComment",
        id: string,
        staffId: string,
        text: string,
        createdAt: string,
      } | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type WorkflowsByStaffIdQueryVariables = {
  staffId: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelWorkflowFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type WorkflowsByStaffIdQuery = {
  workflowsByStaffId?:  {
    __typename: "ModelWorkflowConnection",
    items:  Array< {
      __typename: "Workflow",
      id: string,
      category?: WorkflowCategory | null,
      staffId: string,
      status: WorkflowStatus,
      overTimeDetails?:  {
        __typename: "OverTimeWorkflow",
        date: string,
        startTime: string,
        endTime: string,
        reason: string,
      } | null,
      comments?:  Array< {
        __typename: "WorkflowComment",
        id: string,
        staffId: string,
        text: string,
        createdAt: string,
      } | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateCheckForUpdateSubscriptionVariables = {
  filter?: ModelSubscriptionCheckForUpdateFilterInput | null,
};

export type OnCreateCheckForUpdateSubscription = {
  onCreateCheckForUpdate?:  {
    __typename: "CheckForUpdate",
    id: string,
    deployUuid: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateCheckForUpdateSubscriptionVariables = {
  filter?: ModelSubscriptionCheckForUpdateFilterInput | null,
};

export type OnUpdateCheckForUpdateSubscription = {
  onUpdateCheckForUpdate?:  {
    __typename: "CheckForUpdate",
    id: string,
    deployUuid: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteCheckForUpdateSubscriptionVariables = {
  filter?: ModelSubscriptionCheckForUpdateFilterInput | null,
};

export type OnDeleteCheckForUpdateSubscription = {
  onDeleteCheckForUpdate?:  {
    __typename: "CheckForUpdate",
    id: string,
    deployUuid: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateAppConfigSubscriptionVariables = {
  filter?: ModelSubscriptionAppConfigFilterInput | null,
};

export type OnCreateAppConfigSubscription = {
  onCreateAppConfig?:  {
    __typename: "AppConfig",
    id: string,
    name: string,
    workStartTime?: string | null,
    workEndTime?: string | null,
    lunchRestStartTime?: string | null,
    lunchRestEndTime?: string | null,
    amHolidayStartTime?: string | null,
    amHolidayEndTime?: string | null,
    pmHolidayStartTime?: string | null,
    pmHolidayEndTime?: string | null,
    specialHolidayEnabled?: boolean | null,
    amPmHolidayEnabled?: boolean | null,
    officeMode?: boolean | null,
    absentEnabled?: boolean | null,
    hourlyPaidHolidayEnabled?: boolean | null,
    links?:  Array< {
      __typename: "Link",
      label: string,
      url: string,
      enabled: boolean,
      icon?: string | null,
    } | null > | null,
    reasons?:  Array< {
      __typename: "Reason",
      reason: string,
      enabled: boolean,
    } | null > | null,
    quickInputStartTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    quickInputEndTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateAppConfigSubscriptionVariables = {
  filter?: ModelSubscriptionAppConfigFilterInput | null,
};

export type OnUpdateAppConfigSubscription = {
  onUpdateAppConfig?:  {
    __typename: "AppConfig",
    id: string,
    name: string,
    workStartTime?: string | null,
    workEndTime?: string | null,
    lunchRestStartTime?: string | null,
    lunchRestEndTime?: string | null,
    amHolidayStartTime?: string | null,
    amHolidayEndTime?: string | null,
    pmHolidayStartTime?: string | null,
    pmHolidayEndTime?: string | null,
    specialHolidayEnabled?: boolean | null,
    amPmHolidayEnabled?: boolean | null,
    officeMode?: boolean | null,
    absentEnabled?: boolean | null,
    hourlyPaidHolidayEnabled?: boolean | null,
    links?:  Array< {
      __typename: "Link",
      label: string,
      url: string,
      enabled: boolean,
      icon?: string | null,
    } | null > | null,
    reasons?:  Array< {
      __typename: "Reason",
      reason: string,
      enabled: boolean,
    } | null > | null,
    quickInputStartTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    quickInputEndTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteAppConfigSubscriptionVariables = {
  filter?: ModelSubscriptionAppConfigFilterInput | null,
};

export type OnDeleteAppConfigSubscription = {
  onDeleteAppConfig?:  {
    __typename: "AppConfig",
    id: string,
    name: string,
    workStartTime?: string | null,
    workEndTime?: string | null,
    lunchRestStartTime?: string | null,
    lunchRestEndTime?: string | null,
    amHolidayStartTime?: string | null,
    amHolidayEndTime?: string | null,
    pmHolidayStartTime?: string | null,
    pmHolidayEndTime?: string | null,
    specialHolidayEnabled?: boolean | null,
    amPmHolidayEnabled?: boolean | null,
    officeMode?: boolean | null,
    absentEnabled?: boolean | null,
    hourlyPaidHolidayEnabled?: boolean | null,
    links?:  Array< {
      __typename: "Link",
      label: string,
      url: string,
      enabled: boolean,
      icon?: string | null,
    } | null > | null,
    reasons?:  Array< {
      __typename: "Reason",
      reason: string,
      enabled: boolean,
    } | null > | null,
    quickInputStartTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    quickInputEndTimes?:  Array< {
      __typename: "QuickInputTime",
      time: string,
      enabled: boolean,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateStaffSubscriptionVariables = {
  filter?: ModelSubscriptionStaffFilterInput | null,
};

export type OnCreateStaffSubscription = {
  onCreateStaff?:  {
    __typename: "Staff",
    id: string,
    cognitoUserId: string,
    familyName?: string | null,
    givenName?: string | null,
    mailAddress: string,
    role: string,
    enabled: boolean,
    status: string,
    owner?: boolean | null,
    usageStartDate?: string | null,
    notifications?:  {
      __typename: "Notification",
      workStart?: boolean | null,
      workEnd?: boolean | null,
    } | null,
    sortKey?: string | null,
    workType?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateStaffSubscriptionVariables = {
  filter?: ModelSubscriptionStaffFilterInput | null,
};

export type OnUpdateStaffSubscription = {
  onUpdateStaff?:  {
    __typename: "Staff",
    id: string,
    cognitoUserId: string,
    familyName?: string | null,
    givenName?: string | null,
    mailAddress: string,
    role: string,
    enabled: boolean,
    status: string,
    owner?: boolean | null,
    usageStartDate?: string | null,
    notifications?:  {
      __typename: "Notification",
      workStart?: boolean | null,
      workEnd?: boolean | null,
    } | null,
    sortKey?: string | null,
    workType?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteStaffSubscriptionVariables = {
  filter?: ModelSubscriptionStaffFilterInput | null,
};

export type OnDeleteStaffSubscription = {
  onDeleteStaff?:  {
    __typename: "Staff",
    id: string,
    cognitoUserId: string,
    familyName?: string | null,
    givenName?: string | null,
    mailAddress: string,
    role: string,
    enabled: boolean,
    status: string,
    owner?: boolean | null,
    usageStartDate?: string | null,
    notifications?:  {
      __typename: "Notification",
      workStart?: boolean | null,
      workEnd?: boolean | null,
    } | null,
    sortKey?: string | null,
    workType?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateHolidayCalendarSubscriptionVariables = {
  filter?: ModelSubscriptionHolidayCalendarFilterInput | null,
};

export type OnCreateHolidayCalendarSubscription = {
  onCreateHolidayCalendar?:  {
    __typename: "HolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateHolidayCalendarSubscriptionVariables = {
  filter?: ModelSubscriptionHolidayCalendarFilterInput | null,
};

export type OnUpdateHolidayCalendarSubscription = {
  onUpdateHolidayCalendar?:  {
    __typename: "HolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteHolidayCalendarSubscriptionVariables = {
  filter?: ModelSubscriptionHolidayCalendarFilterInput | null,
};

export type OnDeleteHolidayCalendarSubscription = {
  onDeleteHolidayCalendar?:  {
    __typename: "HolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateCompanyHolidayCalendarSubscriptionVariables = {
  filter?: ModelSubscriptionCompanyHolidayCalendarFilterInput | null,
};

export type OnCreateCompanyHolidayCalendarSubscription = {
  onCreateCompanyHolidayCalendar?:  {
    __typename: "CompanyHolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateCompanyHolidayCalendarSubscriptionVariables = {
  filter?: ModelSubscriptionCompanyHolidayCalendarFilterInput | null,
};

export type OnUpdateCompanyHolidayCalendarSubscription = {
  onUpdateCompanyHolidayCalendar?:  {
    __typename: "CompanyHolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteCompanyHolidayCalendarSubscriptionVariables = {
  filter?: ModelSubscriptionCompanyHolidayCalendarFilterInput | null,
};

export type OnDeleteCompanyHolidayCalendarSubscription = {
  onDeleteCompanyHolidayCalendar?:  {
    __typename: "CompanyHolidayCalendar",
    id: string,
    holidayDate: string,
    name: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateCloseDateSubscriptionVariables = {
  filter?: ModelSubscriptionCloseDateFilterInput | null,
};

export type OnCreateCloseDateSubscription = {
  onCreateCloseDate?:  {
    __typename: "CloseDate",
    id: string,
    closeDate: string,
    startDate: string,
    endDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateCloseDateSubscriptionVariables = {
  filter?: ModelSubscriptionCloseDateFilterInput | null,
};

export type OnUpdateCloseDateSubscription = {
  onUpdateCloseDate?:  {
    __typename: "CloseDate",
    id: string,
    closeDate: string,
    startDate: string,
    endDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteCloseDateSubscriptionVariables = {
  filter?: ModelSubscriptionCloseDateFilterInput | null,
};

export type OnDeleteCloseDateSubscription = {
  onDeleteCloseDate?:  {
    __typename: "CloseDate",
    id: string,
    closeDate: string,
    startDate: string,
    endDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateAttendanceSubscriptionVariables = {
  filter?: ModelSubscriptionAttendanceFilterInput | null,
};

export type OnCreateAttendanceSubscription = {
  onCreateAttendance?:  {
    __typename: "Attendance",
    id: string,
    staffId: string,
    workDate: string,
    startTime?: string | null,
    endTime?: string | null,
    goDirectlyFlag?: boolean | null,
    returnDirectlyFlag?: boolean | null,
    absentFlag?: boolean | null,
    rests?:  Array< {
      __typename: "Rest",
      startTime?: string | null,
      endTime?: string | null,
    } | null > | null,
    hourlyPaidHolidayTimes?:  Array< {
      __typename: "HourlyPaidHolidayTime",
      startTime: string,
      endTime: string,
    } | null > | null,
    remarks?: string | null,
    paidHolidayFlag?: boolean | null,
    specialHolidayFlag?: boolean | null,
    isDeemedHoliday?: boolean | null,
    hourlyPaidHolidayHours?: number | null,
    substituteHolidayDate?: string | null,
    histories?:  Array< {
      __typename: "AttendanceHistory",
      staffId: string,
      workDate: string,
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      createdAt: string,
    } | null > | null,
    changeRequests?:  Array< {
      __typename: "AttendanceChangeRequest",
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      completed?: boolean | null,
      comment?: string | null,
      staffComment?: string | null,
    } | null > | null,
    systemComments?:  Array< {
      __typename: "SystemComment",
      comment: string,
      confirmed: boolean,
      createdAt: string,
    } | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateAttendanceSubscriptionVariables = {
  filter?: ModelSubscriptionAttendanceFilterInput | null,
};

export type OnUpdateAttendanceSubscription = {
  onUpdateAttendance?:  {
    __typename: "Attendance",
    id: string,
    staffId: string,
    workDate: string,
    startTime?: string | null,
    endTime?: string | null,
    goDirectlyFlag?: boolean | null,
    returnDirectlyFlag?: boolean | null,
    absentFlag?: boolean | null,
    rests?:  Array< {
      __typename: "Rest",
      startTime?: string | null,
      endTime?: string | null,
    } | null > | null,
    hourlyPaidHolidayTimes?:  Array< {
      __typename: "HourlyPaidHolidayTime",
      startTime: string,
      endTime: string,
    } | null > | null,
    remarks?: string | null,
    paidHolidayFlag?: boolean | null,
    specialHolidayFlag?: boolean | null,
    isDeemedHoliday?: boolean | null,
    hourlyPaidHolidayHours?: number | null,
    substituteHolidayDate?: string | null,
    histories?:  Array< {
      __typename: "AttendanceHistory",
      staffId: string,
      workDate: string,
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      createdAt: string,
    } | null > | null,
    changeRequests?:  Array< {
      __typename: "AttendanceChangeRequest",
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      completed?: boolean | null,
      comment?: string | null,
      staffComment?: string | null,
    } | null > | null,
    systemComments?:  Array< {
      __typename: "SystemComment",
      comment: string,
      confirmed: boolean,
      createdAt: string,
    } | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteAttendanceSubscriptionVariables = {
  filter?: ModelSubscriptionAttendanceFilterInput | null,
};

export type OnDeleteAttendanceSubscription = {
  onDeleteAttendance?:  {
    __typename: "Attendance",
    id: string,
    staffId: string,
    workDate: string,
    startTime?: string | null,
    endTime?: string | null,
    goDirectlyFlag?: boolean | null,
    returnDirectlyFlag?: boolean | null,
    absentFlag?: boolean | null,
    rests?:  Array< {
      __typename: "Rest",
      startTime?: string | null,
      endTime?: string | null,
    } | null > | null,
    hourlyPaidHolidayTimes?:  Array< {
      __typename: "HourlyPaidHolidayTime",
      startTime: string,
      endTime: string,
    } | null > | null,
    remarks?: string | null,
    paidHolidayFlag?: boolean | null,
    specialHolidayFlag?: boolean | null,
    isDeemedHoliday?: boolean | null,
    hourlyPaidHolidayHours?: number | null,
    substituteHolidayDate?: string | null,
    histories?:  Array< {
      __typename: "AttendanceHistory",
      staffId: string,
      workDate: string,
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      createdAt: string,
    } | null > | null,
    changeRequests?:  Array< {
      __typename: "AttendanceChangeRequest",
      startTime?: string | null,
      endTime?: string | null,
      goDirectlyFlag?: boolean | null,
      absentFlag?: boolean | null,
      returnDirectlyFlag?: boolean | null,
      rests?:  Array< {
        __typename: "Rest",
        startTime?: string | null,
        endTime?: string | null,
      } | null > | null,
      hourlyPaidHolidayTimes?:  Array< {
        __typename: "HourlyPaidHolidayTime",
        startTime: string,
        endTime: string,
      } | null > | null,
      remarks?: string | null,
      paidHolidayFlag?: boolean | null,
      specialHolidayFlag?: boolean | null,
      hourlyPaidHolidayHours?: number | null,
      substituteHolidayFlag?: boolean | null,
      substituteHolidayDate?: string | null,
      completed?: boolean | null,
      comment?: string | null,
      staffComment?: string | null,
    } | null > | null,
    systemComments?:  Array< {
      __typename: "SystemComment",
      comment: string,
      confirmed: boolean,
      createdAt: string,
    } | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateDocumentSubscriptionVariables = {
  filter?: ModelSubscriptionDocumentFilterInput | null,
};

export type OnCreateDocumentSubscription = {
  onCreateDocument?:  {
    __typename: "Document",
    id: string,
    title: string,
    content: string,
    tag?: Array< string | null > | null,
    targetRole?: Array< string | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateDocumentSubscriptionVariables = {
  filter?: ModelSubscriptionDocumentFilterInput | null,
};

export type OnUpdateDocumentSubscription = {
  onUpdateDocument?:  {
    __typename: "Document",
    id: string,
    title: string,
    content: string,
    tag?: Array< string | null > | null,
    targetRole?: Array< string | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteDocumentSubscriptionVariables = {
  filter?: ModelSubscriptionDocumentFilterInput | null,
};

export type OnDeleteDocumentSubscription = {
  onDeleteDocument?:  {
    __typename: "Document",
    id: string,
    title: string,
    content: string,
    tag?: Array< string | null > | null,
    targetRole?: Array< string | null > | null,
    revision?: number | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateWorkflowSubscriptionVariables = {
  filter?: ModelSubscriptionWorkflowFilterInput | null,
};

export type OnCreateWorkflowSubscription = {
  onCreateWorkflow?:  {
    __typename: "Workflow",
    id: string,
    category?: WorkflowCategory | null,
    staffId: string,
    status: WorkflowStatus,
    overTimeDetails?:  {
      __typename: "OverTimeWorkflow",
      date: string,
      startTime: string,
      endTime: string,
      reason: string,
    } | null,
    comments?:  Array< {
      __typename: "WorkflowComment",
      id: string,
      staffId: string,
      text: string,
      createdAt: string,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateWorkflowSubscriptionVariables = {
  filter?: ModelSubscriptionWorkflowFilterInput | null,
};

export type OnUpdateWorkflowSubscription = {
  onUpdateWorkflow?:  {
    __typename: "Workflow",
    id: string,
    category?: WorkflowCategory | null,
    staffId: string,
    status: WorkflowStatus,
    overTimeDetails?:  {
      __typename: "OverTimeWorkflow",
      date: string,
      startTime: string,
      endTime: string,
      reason: string,
    } | null,
    comments?:  Array< {
      __typename: "WorkflowComment",
      id: string,
      staffId: string,
      text: string,
      createdAt: string,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteWorkflowSubscriptionVariables = {
  filter?: ModelSubscriptionWorkflowFilterInput | null,
};

export type OnDeleteWorkflowSubscription = {
  onDeleteWorkflow?:  {
    __typename: "Workflow",
    id: string,
    category?: WorkflowCategory | null,
    staffId: string,
    status: WorkflowStatus,
    overTimeDetails?:  {
      __typename: "OverTimeWorkflow",
      date: string,
      startTime: string,
      endTime: string,
      reason: string,
    } | null,
    comments?:  Array< {
      __typename: "WorkflowComment",
      id: string,
      staffId: string,
      text: string,
      createdAt: string,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
