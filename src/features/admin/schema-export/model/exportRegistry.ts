import {
  listAppConfigs,
  listAttendances,
  listAuditLogs,
  listCheckForUpdates,
  listCloseDates,
  listCompanyHolidayCalendars,
  listDailyReports,
  listDocuments,
  listEventCalendars,
  listHolidayCalendars,
  listOperationLogs,
  listShiftPlanYears,
  listShiftRequests,
  listStaff,
  listWorkflowNotificationEvents,
  listWorkflows,
  listWorkflowTemplates,
} from "@/shared/api/graphql/documents/queries";

export type ExportConnection = {
  items?: Array<Record<string, unknown> | null> | null;
  nextToken?: string | null;
} | null;

export type ExportModelDefinition = {
  modelName: string;
  displayName: string;
  query: string;
  getConnection: (data: Record<string, unknown> | null) => ExportConnection;
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
};

const buildModelDefinition = (
  modelName: string,
  query: string,
  connectionKey: string
): ExportModelDefinition => ({
  modelName,
  displayName: modelName,
  query,
  getConnection: (data) => toRecord(data?.[connectionKey]) as ExportConnection,
});

export const EXPORT_MODEL_DEFINITIONS: ExportModelDefinition[] = [
  buildModelDefinition(
    "CheckForUpdate",
    listCheckForUpdates,
    "listCheckForUpdates"
  ),
  buildModelDefinition("AppConfig", listAppConfigs, "listAppConfigs"),
  buildModelDefinition("Staff", listStaff, "listStaff"),
  buildModelDefinition(
    "HolidayCalendar",
    listHolidayCalendars,
    "listHolidayCalendars"
  ),
  buildModelDefinition(
    "CompanyHolidayCalendar",
    listCompanyHolidayCalendars,
    "listCompanyHolidayCalendars"
  ),
  buildModelDefinition(
    "EventCalendar",
    listEventCalendars,
    "listEventCalendars"
  ),
  buildModelDefinition("CloseDate", listCloseDates, "listCloseDates"),
  buildModelDefinition("Attendance", listAttendances, "listAttendances"),
  buildModelDefinition("Document", listDocuments, "listDocuments"),
  buildModelDefinition("ShiftRequest", listShiftRequests, "listShiftRequests"),
  buildModelDefinition(
    "ShiftPlanYear",
    listShiftPlanYears,
    "listShiftPlanYears"
  ),
  buildModelDefinition("Workflow", listWorkflows, "listWorkflows"),
  buildModelDefinition(
    "WorkflowTemplate",
    listWorkflowTemplates,
    "listWorkflowTemplates"
  ),
  buildModelDefinition(
    "WorkflowNotificationEvent",
    listWorkflowNotificationEvents,
    "listWorkflowNotificationEvents"
  ),
  buildModelDefinition(
    "OperationLog",
    listOperationLogs,
    "listOperationLogs"
  ),
  buildModelDefinition("AuditLog", listAuditLogs, "listAuditLogs"),
  buildModelDefinition("DailyReport", listDailyReports, "listDailyReports"),
];

export const getExportModelDefinition = (modelName: string) =>
  EXPORT_MODEL_DEFINITIONS.find((definition) => definition.modelName === modelName);
