import { createApi } from "@reduxjs/toolkit/query/react";
import {
  createCompanyHolidayCalendar,
  createEventCalendar,
  createHolidayCalendar,
  deleteCompanyHolidayCalendar,
  deleteEventCalendar,
  deleteHolidayCalendar,
  updateCompanyHolidayCalendar,
  updateEventCalendar,
  updateHolidayCalendar,
} from "@shared/api/graphql/documents/mutations";
import {
  listCompanyHolidayCalendars,
  listEventCalendars,
  listHolidayCalendars,
} from "@shared/api/graphql/documents/queries";
import { graphqlBaseQuery, type GraphQLBaseQueryArgs, type GraphQLBaseQueryError } from "@shared/api/graphql/graphqlBaseQuery";
import { executePaginatedQuery } from "@shared/api/graphql/paginatedQuery";
import { buildListAndItemTags } from "@shared/api/graphql/tagBuilder";
import type {
  CompanyHolidayCalendar,
  CreateCompanyHolidayCalendarInput,
  CreateCompanyHolidayCalendarMutation,
  CreateEventCalendarInput,
  CreateEventCalendarMutation,
  CreateHolidayCalendarInput,
  CreateHolidayCalendarMutation,
  DeleteCompanyHolidayCalendarInput,
  DeleteCompanyHolidayCalendarMutation,
  DeleteEventCalendarInput,
  DeleteEventCalendarMutation,
  DeleteHolidayCalendarInput,
  DeleteHolidayCalendarMutation,
  EventCalendar,
  HolidayCalendar,
  ListCompanyHolidayCalendarsQuery,
  ListEventCalendarsQuery,
  ListHolidayCalendarsQuery,
  ModelCompanyHolidayCalendarConditionInput,
  ModelEventCalendarConditionInput,
  ModelHolidayCalendarConditionInput,
  UpdateCompanyHolidayCalendarInput,
  UpdateCompanyHolidayCalendarMutation,
  UpdateEventCalendarInput,
  UpdateEventCalendarMutation,
  UpdateHolidayCalendarInput,
  UpdateHolidayCalendarMutation,
} from "@shared/api/graphql/types";
import { type UpdatePayload } from "@shared/api/graphql/updatePayload";

export type UpdateHolidayCalendarPayload = UpdatePayload<UpdateHolidayCalendarInput, ModelHolidayCalendarConditionInput>;

export type UpdateCompanyHolidayCalendarPayload = UpdatePayload<UpdateCompanyHolidayCalendarInput, ModelCompanyHolidayCalendarConditionInput>;

export type UpdateEventCalendarPayload = UpdatePayload<UpdateEventCalendarInput, ModelEventCalendarConditionInput>;

// Exported for testing
export const nonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

// Exported for testing
export const buildCalendarTagId = (calendar: {
  id?: string | null;
  holidayDate?: string | null;
}) => calendar.id ?? calendar.holidayDate ?? "unknown";

type CalendarBaseQuery = (arg: GraphQLBaseQueryArgs) => Promise<{ data?: unknown; error?: GraphQLBaseQueryError }>;

async function executeCreateHolidayCalendar(input: CreateHolidayCalendarInput, bq: CalendarBaseQuery): Promise<{ data: HolidayCalendar } | { error: GraphQLBaseQueryError }> {
  const result = await bq({ document: createHolidayCalendar, variables: { input } });
  if (result.error) return { error: result.error };
  const created = (result.data as CreateHolidayCalendarMutation | null)?.createHolidayCalendar;
  return created ? { data: created } : { error: { message: "Failed to create holiday calendar" } };
}

async function executeBulkCreateHolidayCalendars(inputs: CreateHolidayCalendarInput[], bq: CalendarBaseQuery): Promise<{ data: HolidayCalendar[] } | { error: GraphQLBaseQueryError }> {
  const created: HolidayCalendar[] = [];
  for (const input of inputs) {
    const result = await bq({ document: createHolidayCalendar, variables: { input } });
    if (result.error) return { error: result.error };
    const calendar = (result.data as CreateHolidayCalendarMutation | null)?.createHolidayCalendar;
    if (!calendar) return { error: { message: "Failed to create holiday calendar" } };
    created.push(calendar);
  }
  return { data: created };
}

async function executeUpdateHolidayCalendar({ input, condition }: UpdateHolidayCalendarPayload, bq: CalendarBaseQuery): Promise<{ data: HolidayCalendar } | { error: GraphQLBaseQueryError }> {
  const result = await bq({ document: updateHolidayCalendar, variables: { input, condition: condition ?? undefined } });
  if (result.error) return { error: result.error };
  const updated = (result.data as UpdateHolidayCalendarMutation | null)?.updateHolidayCalendar;
  return updated ? { data: updated } : { error: { message: "Failed to update holiday calendar" } };
}

async function executeDeleteHolidayCalendar(input: DeleteHolidayCalendarInput, bq: CalendarBaseQuery): Promise<{ data: HolidayCalendar } | { error: GraphQLBaseQueryError }> {
  const result = await bq({ document: deleteHolidayCalendar, variables: { input } });
  if (result.error) return { error: result.error };
  const deleted = (result.data as DeleteHolidayCalendarMutation | null)?.deleteHolidayCalendar;
  return deleted ? { data: deleted } : { error: { message: "Failed to delete holiday calendar" } };
}

async function executeCreateCompanyHolidayCalendar(input: CreateCompanyHolidayCalendarInput, bq: CalendarBaseQuery): Promise<{ data: CompanyHolidayCalendar } | { error: GraphQLBaseQueryError }> {
  const result = await bq({ document: createCompanyHolidayCalendar, variables: { input } });
  if (result.error) return { error: result.error };
  const created = (result.data as CreateCompanyHolidayCalendarMutation | null)?.createCompanyHolidayCalendar;
  return created ? { data: created } : { error: { message: "Failed to create company holiday calendar" } };
}

async function executeBulkCreateCompanyHolidayCalendars(inputs: CreateCompanyHolidayCalendarInput[], bq: CalendarBaseQuery): Promise<{ data: CompanyHolidayCalendar[] } | { error: GraphQLBaseQueryError }> {
  const created: CompanyHolidayCalendar[] = [];
  for (const input of inputs) {
    const result = await bq({ document: createCompanyHolidayCalendar, variables: { input } });
    if (result.error) return { error: result.error };
    const calendar = (result.data as CreateCompanyHolidayCalendarMutation | null)?.createCompanyHolidayCalendar;
    if (!calendar) return { error: { message: "Failed to create company holiday calendar" } };
    created.push(calendar);
  }
  return { data: created };
}

async function executeUpdateCompanyHolidayCalendar({ input, condition }: UpdateCompanyHolidayCalendarPayload, bq: CalendarBaseQuery): Promise<{ data: CompanyHolidayCalendar } | { error: GraphQLBaseQueryError }> {
  const result = await bq({ document: updateCompanyHolidayCalendar, variables: { input, condition: condition ?? undefined } });
  if (result.error) return { error: result.error };
  const updated = (result.data as UpdateCompanyHolidayCalendarMutation | null)?.updateCompanyHolidayCalendar;
  return updated ? { data: updated } : { error: { message: "Failed to update company holiday calendar" } };
}

async function executeDeleteCompanyHolidayCalendar(input: DeleteCompanyHolidayCalendarInput, bq: CalendarBaseQuery): Promise<{ data: CompanyHolidayCalendar } | { error: GraphQLBaseQueryError }> {
  const result = await bq({ document: deleteCompanyHolidayCalendar, variables: { input } });
  if (result.error) return { error: result.error };
  const deleted = (result.data as DeleteCompanyHolidayCalendarMutation | null)?.deleteCompanyHolidayCalendar;
  return deleted ? { data: deleted } : { error: { message: "Failed to delete company holiday calendar" } };
}

async function executeCreateEventCalendar(input: CreateEventCalendarInput, bq: CalendarBaseQuery): Promise<{ data: EventCalendar } | { error: GraphQLBaseQueryError }> {
  const result = await bq({ document: createEventCalendar, variables: { input } });
  if (result.error) return { error: result.error };
  const created = (result.data as CreateEventCalendarMutation | null)?.createEventCalendar;
  return created ? { data: created } : { error: { message: "Failed to create event calendar" } };
}

async function executeBulkCreateEventCalendars(inputs: CreateEventCalendarInput[], bq: CalendarBaseQuery): Promise<{ data: EventCalendar[] } | { error: GraphQLBaseQueryError }> {
  const created: EventCalendar[] = [];
  for (const input of inputs) {
    const result = await bq({ document: createEventCalendar, variables: { input } });
    if (result.error) return { error: result.error };
    const calendar = (result.data as CreateEventCalendarMutation | null)?.createEventCalendar;
    if (!calendar) return { error: { message: "Failed to create event calendar" } };
    created.push(calendar);
  }
  return { data: created };
}

async function executeUpdateEventCalendar({ input, condition }: UpdateEventCalendarPayload, bq: CalendarBaseQuery): Promise<{ data: EventCalendar } | { error: GraphQLBaseQueryError }> {
  const result = await bq({ document: updateEventCalendar, variables: { input, condition: condition ?? undefined } });
  if (result.error) return { error: result.error };
  const updated = (result.data as UpdateEventCalendarMutation | null)?.updateEventCalendar;
  return updated ? { data: updated } : { error: { message: "Failed to update event calendar" } };
}

async function executeDeleteEventCalendar(input: DeleteEventCalendarInput, bq: CalendarBaseQuery): Promise<{ data: EventCalendar } | { error: GraphQLBaseQueryError }> {
  const result = await bq({ document: deleteEventCalendar, variables: { input } });
  if (result.error) return { error: result.error };
  const deleted = (result.data as DeleteEventCalendarMutation | null)?.deleteEventCalendar;
  return deleted ? { data: deleted } : { error: { message: "Failed to delete event calendar" } };
}

export const calendarApi = createApi({
  reducerPath: "calendarApi",
  baseQuery: graphqlBaseQuery(),
  tagTypes: ["HolidayCalendar", "CompanyHolidayCalendar", "EventCalendar"],
  endpoints: (builder) => ({
    getHolidayCalendars: builder.query<HolidayCalendar[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        return executePaginatedQuery<HolidayCalendar>({
          baseQuery,
          document: listHolidayCalendars,
          connectionExtractor: (data) =>
            (data as ListHolidayCalendarsQuery | null)?.listHolidayCalendars,
          errorMessage: "Failed to fetch holiday calendars",
        });
      },
      providesTags: (result) =>
        buildListAndItemTags("HolidayCalendar", result, buildCalendarTagId),
    }),
    getCompanyHolidayCalendars: builder.query<CompanyHolidayCalendar[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        return executePaginatedQuery<CompanyHolidayCalendar>({
          baseQuery,
          document: listCompanyHolidayCalendars,
          connectionExtractor: (data) =>
            (data as ListCompanyHolidayCalendarsQuery | null)?.listCompanyHolidayCalendars,
          errorMessage: "Failed to fetch company holiday calendars",
        });
      },
      providesTags: (result) =>
        buildListAndItemTags("CompanyHolidayCalendar", result, buildCalendarTagId),
    }),
    createHolidayCalendar: builder.mutation<HolidayCalendar, CreateHolidayCalendarInput>({
      async queryFn(input, _q, _e, bq) { return executeCreateHolidayCalendar(input, bq as CalendarBaseQuery); },
      invalidatesTags: (result) => buildListAndItemTags("HolidayCalendar", result ? [result] : undefined, buildCalendarTagId),
    }),
    bulkCreateHolidayCalendars: builder.mutation<HolidayCalendar[], CreateHolidayCalendarInput[]>({
      async queryFn(inputs, _q, _e, bq) { return executeBulkCreateHolidayCalendars(inputs, bq as CalendarBaseQuery); },
      invalidatesTags: [{ type: "HolidayCalendar", id: "LIST" }],
    }),
    updateHolidayCalendar: builder.mutation<HolidayCalendar, UpdateHolidayCalendarPayload>({
      async queryFn(arg, _q, _e, bq) { return executeUpdateHolidayCalendar(arg, bq as CalendarBaseQuery); },
      invalidatesTags: (result) => buildListAndItemTags("HolidayCalendar", result ? [result] : undefined, buildCalendarTagId),
    }),
    deleteHolidayCalendar: builder.mutation<HolidayCalendar, DeleteHolidayCalendarInput>({
      async queryFn(input, _q, _e, bq) { return executeDeleteHolidayCalendar(input, bq as CalendarBaseQuery); },
      invalidatesTags: (result, _error, arg) => {
        const targetId = arg.id ?? buildCalendarTagId(result ?? {});
        return [{ type: "HolidayCalendar", id: "LIST" }, { type: "HolidayCalendar", id: targetId }];
      },
    }),
    createCompanyHolidayCalendar: builder.mutation<CompanyHolidayCalendar, CreateCompanyHolidayCalendarInput>({
      async queryFn(input, _q, _e, bq) { return executeCreateCompanyHolidayCalendar(input, bq as CalendarBaseQuery); },
      invalidatesTags: (result) => buildListAndItemTags("CompanyHolidayCalendar", result ? [result] : undefined, buildCalendarTagId),
    }),
    bulkCreateCompanyHolidayCalendars: builder.mutation<CompanyHolidayCalendar[], CreateCompanyHolidayCalendarInput[]>({
      async queryFn(inputs, _q, _e, bq) { return executeBulkCreateCompanyHolidayCalendars(inputs, bq as CalendarBaseQuery); },
      invalidatesTags: [{ type: "CompanyHolidayCalendar", id: "LIST" }],
    }),
    updateCompanyHolidayCalendar: builder.mutation<CompanyHolidayCalendar, UpdateCompanyHolidayCalendarPayload>({
      async queryFn(arg, _q, _e, bq) { return executeUpdateCompanyHolidayCalendar(arg, bq as CalendarBaseQuery); },
      invalidatesTags: (result) => buildListAndItemTags("CompanyHolidayCalendar", result ? [result] : undefined, buildCalendarTagId),
    }),
    deleteCompanyHolidayCalendar: builder.mutation<CompanyHolidayCalendar, DeleteCompanyHolidayCalendarInput>({
      async queryFn(input, _q, _e, bq) { return executeDeleteCompanyHolidayCalendar(input, bq as CalendarBaseQuery); },
      invalidatesTags: (result, _error, arg) => {
        const targetId = arg.id ?? buildCalendarTagId(result ?? {});
        return [{ type: "CompanyHolidayCalendar", id: "LIST" }, { type: "CompanyHolidayCalendar", id: targetId }];
      },
    }),
    getEventCalendars: builder.query<EventCalendar[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        return executePaginatedQuery<EventCalendar>({
          baseQuery,
          document: listEventCalendars,
          connectionExtractor: (data) =>
            (data as ListEventCalendarsQuery | null)?.listEventCalendars,
          errorMessage: "Failed to fetch event calendars",
        });
      },
      providesTags: (result) =>
        buildListAndItemTags("EventCalendar", result, buildCalendarTagId),
    }),
    createEventCalendar: builder.mutation<EventCalendar, CreateEventCalendarInput>({
      async queryFn(input, _q, _e, bq) { return executeCreateEventCalendar(input, bq as CalendarBaseQuery); },
      invalidatesTags: (result) => buildListAndItemTags("EventCalendar", result ? [result] : undefined, buildCalendarTagId),
    }),
    bulkCreateEventCalendars: builder.mutation<EventCalendar[], CreateEventCalendarInput[]>({
      async queryFn(inputs, _q, _e, bq) { return executeBulkCreateEventCalendars(inputs, bq as CalendarBaseQuery); },
      invalidatesTags: [{ type: "EventCalendar", id: "LIST" }],
    }),
    updateEventCalendar: builder.mutation<EventCalendar, UpdateEventCalendarPayload>({
      async queryFn(arg, _q, _e, bq) { return executeUpdateEventCalendar(arg, bq as CalendarBaseQuery); },
      invalidatesTags: (result) => buildListAndItemTags("EventCalendar", result ? [result] : undefined, buildCalendarTagId),
    }),
    deleteEventCalendar: builder.mutation<EventCalendar, DeleteEventCalendarInput>({
      async queryFn(input, _q, _e, bq) { return executeDeleteEventCalendar(input, bq as CalendarBaseQuery); },
      invalidatesTags: (result, _error, arg) => {
        const targetId = arg.id ?? buildCalendarTagId(result ?? {});
        return [{ type: "EventCalendar", id: "LIST" }, { type: "EventCalendar", id: targetId }];
      },
    }),
  }),
});

export const {
  useGetHolidayCalendarsQuery,
  useGetCompanyHolidayCalendarsQuery,
  useGetEventCalendarsQuery,
  useCreateHolidayCalendarMutation,
  useBulkCreateHolidayCalendarsMutation,
  useUpdateHolidayCalendarMutation,
  useDeleteHolidayCalendarMutation,
  useCreateCompanyHolidayCalendarMutation,
  useBulkCreateCompanyHolidayCalendarsMutation,
  useUpdateCompanyHolidayCalendarMutation,
  useDeleteCompanyHolidayCalendarMutation,
  useCreateEventCalendarMutation,
  useBulkCreateEventCalendarsMutation,
  useUpdateEventCalendarMutation,
  useDeleteEventCalendarMutation,
} = calendarApi;
