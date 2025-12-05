import { createApi } from "@reduxjs/toolkit/query/react";

import type {
  CompanyHolidayCalendar,
  CreateCompanyHolidayCalendarInput,
  CreateCompanyHolidayCalendarMutation,
  CreateHolidayCalendarInput,
  CreateHolidayCalendarMutation,
  DeleteCompanyHolidayCalendarInput,
  DeleteCompanyHolidayCalendarMutation,
  DeleteHolidayCalendarInput,
  DeleteHolidayCalendarMutation,
  HolidayCalendar,
  ListCompanyHolidayCalendarsQuery,
  ListHolidayCalendarsQuery,
  UpdateCompanyHolidayCalendarInput,
  UpdateCompanyHolidayCalendarMutation,
  UpdateHolidayCalendarInput,
  UpdateHolidayCalendarMutation,
} from "@/API";
import {
  createCompanyHolidayCalendar,
  createHolidayCalendar,
  deleteCompanyHolidayCalendar,
  deleteHolidayCalendar,
  updateCompanyHolidayCalendar,
  updateHolidayCalendar,
} from "@/graphql/mutations";
import {
  listCompanyHolidayCalendars,
  listHolidayCalendars,
} from "@/graphql/queries";

import { graphqlBaseQuery } from "./graphqlBaseQuery";

type CalendarTag = {
  type: "HolidayCalendar" | "CompanyHolidayCalendar";
  id: string;
};

const nonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

const buildCalendarTagId = (calendar: {
  id?: string | null;
  holidayDate?: string | null;
}) => calendar.id ?? calendar.holidayDate ?? "unknown";

export const calendarApi = createApi({
  reducerPath: "calendarApi",
  baseQuery: graphqlBaseQuery(),
  tagTypes: ["HolidayCalendar", "CompanyHolidayCalendar"],
  endpoints: (builder) => ({
    getHolidayCalendars: builder.query<HolidayCalendar[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const calendars: HolidayCalendar[] = [];
        let nextToken: string | null = null;

        do {
          const result = await baseQuery({
            document: listHolidayCalendars,
            variables: { nextToken },
          });

          if (result.error) {
            return { error: result.error };
          }

          const data = result.data as ListHolidayCalendarsQuery | null;
          const connection = data?.listHolidayCalendars;

          if (!connection) {
            return { error: { message: "Failed to fetch holiday calendars" } };
          }

          calendars.push(...connection.items.filter(nonNullable));
          nextToken = connection.nextToken ?? null;
        } while (nextToken);

        return { data: calendars };
      },
      providesTags: (result) => {
        const listTag: CalendarTag = { type: "HolidayCalendar", id: "LIST" };
        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          ...result.map((calendar) => ({
            type: "HolidayCalendar" as const,
            id: buildCalendarTagId(calendar),
          })),
        ];
      },
    }),
    getCompanyHolidayCalendars: builder.query<CompanyHolidayCalendar[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const calendars: CompanyHolidayCalendar[] = [];
        let nextToken: string | null = null;

        do {
          const result = await baseQuery({
            document: listCompanyHolidayCalendars,
            variables: { nextToken },
          });

          if (result.error) {
            return { error: result.error };
          }

          const data = result.data as ListCompanyHolidayCalendarsQuery | null;
          const connection = data?.listCompanyHolidayCalendars;

          if (!connection) {
            return {
              error: { message: "Failed to fetch company holiday calendars" },
            };
          }

          calendars.push(...connection.items.filter(nonNullable));
          nextToken = connection.nextToken ?? null;
        } while (nextToken);

        return { data: calendars };
      },
      providesTags: (result) => {
        const listTag: CalendarTag = {
          type: "CompanyHolidayCalendar",
          id: "LIST",
        };
        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          ...result.map((calendar) => ({
            type: "CompanyHolidayCalendar" as const,
            id: buildCalendarTagId(calendar),
          })),
        ];
      },
    }),
    createHolidayCalendar: builder.mutation<
      HolidayCalendar,
      CreateHolidayCalendarInput
    >({
      async queryFn(input, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: createHolidayCalendar,
          variables: { input },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as CreateHolidayCalendarMutation | null;
        const created = data?.createHolidayCalendar;

        if (!created) {
          return { error: { message: "Failed to create holiday calendar" } };
        }

        return { data: created };
      },
      invalidatesTags: (result) => {
        const listTag: CalendarTag = { type: "HolidayCalendar", id: "LIST" };
        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          {
            type: "HolidayCalendar" as const,
            id: buildCalendarTagId(result),
          },
        ];
      },
    }),
    bulkCreateHolidayCalendars: builder.mutation<
      HolidayCalendar[],
      CreateHolidayCalendarInput[]
    >({
      async queryFn(inputs, _queryApi, _extraOptions, baseQuery) {
        const created: HolidayCalendar[] = [];

        for (const input of inputs) {
          const result = await baseQuery({
            document: createHolidayCalendar,
            variables: { input },
          });

          if (result.error) {
            return { error: result.error };
          }

          const data = result.data as CreateHolidayCalendarMutation | null;
          const calendar = data?.createHolidayCalendar;

          if (!calendar) {
            return { error: { message: "Failed to create holiday calendar" } };
          }

          created.push(calendar);
        }

        return { data: created };
      },
      invalidatesTags: [{ type: "HolidayCalendar", id: "LIST" }],
    }),
    updateHolidayCalendar: builder.mutation<
      HolidayCalendar,
      UpdateHolidayCalendarInput
    >({
      async queryFn(input, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: updateHolidayCalendar,
          variables: { input },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as UpdateHolidayCalendarMutation | null;
        const updated = data?.updateHolidayCalendar;

        if (!updated) {
          return { error: { message: "Failed to update holiday calendar" } };
        }

        return { data: updated };
      },
      invalidatesTags: (result) => {
        const listTag: CalendarTag = { type: "HolidayCalendar", id: "LIST" };
        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          {
            type: "HolidayCalendar" as const,
            id: buildCalendarTagId(result),
          },
        ];
      },
    }),
    deleteHolidayCalendar: builder.mutation<
      HolidayCalendar,
      DeleteHolidayCalendarInput
    >({
      async queryFn(input, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: deleteHolidayCalendar,
          variables: { input },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as DeleteHolidayCalendarMutation | null;
        const deleted = data?.deleteHolidayCalendar;

        if (!deleted) {
          return { error: { message: "Failed to delete holiday calendar" } };
        }

        return { data: deleted };
      },
      invalidatesTags: (result, _error, arg) => {
        const listTag: CalendarTag = { type: "HolidayCalendar", id: "LIST" };
        const targetId = arg.id ?? buildCalendarTagId(result ?? {});
        return [listTag, { type: "HolidayCalendar", id: targetId }];
      },
    }),
    createCompanyHolidayCalendar: builder.mutation<
      CompanyHolidayCalendar,
      CreateCompanyHolidayCalendarInput
    >({
      async queryFn(input, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: createCompanyHolidayCalendar,
          variables: { input },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as CreateCompanyHolidayCalendarMutation | null;
        const created = data?.createCompanyHolidayCalendar;

        if (!created) {
          return {
            error: { message: "Failed to create company holiday calendar" },
          };
        }

        return { data: created };
      },
      invalidatesTags: (result) => {
        const listTag: CalendarTag = {
          type: "CompanyHolidayCalendar",
          id: "LIST",
        };
        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          {
            type: "CompanyHolidayCalendar" as const,
            id: buildCalendarTagId(result),
          },
        ];
      },
    }),
    bulkCreateCompanyHolidayCalendars: builder.mutation<
      CompanyHolidayCalendar[],
      CreateCompanyHolidayCalendarInput[]
    >({
      async queryFn(inputs, _queryApi, _extraOptions, baseQuery) {
        const created: CompanyHolidayCalendar[] = [];

        for (const input of inputs) {
          const result = await baseQuery({
            document: createCompanyHolidayCalendar,
            variables: { input },
          });

          if (result.error) {
            return { error: result.error };
          }

          const data =
            result.data as CreateCompanyHolidayCalendarMutation | null;
          const calendar = data?.createCompanyHolidayCalendar;

          if (!calendar) {
            return {
              error: { message: "Failed to create company holiday calendar" },
            };
          }

          created.push(calendar);
        }

        return { data: created };
      },
      invalidatesTags: [{ type: "CompanyHolidayCalendar", id: "LIST" }],
    }),
    updateCompanyHolidayCalendar: builder.mutation<
      CompanyHolidayCalendar,
      UpdateCompanyHolidayCalendarInput
    >({
      async queryFn(input, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: updateCompanyHolidayCalendar,
          variables: { input },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as UpdateCompanyHolidayCalendarMutation | null;
        const updated = data?.updateCompanyHolidayCalendar;

        if (!updated) {
          return {
            error: { message: "Failed to update company holiday calendar" },
          };
        }

        return { data: updated };
      },
      invalidatesTags: (result) => {
        const listTag: CalendarTag = {
          type: "CompanyHolidayCalendar",
          id: "LIST",
        };
        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          {
            type: "CompanyHolidayCalendar" as const,
            id: buildCalendarTagId(result),
          },
        ];
      },
    }),
    deleteCompanyHolidayCalendar: builder.mutation<
      CompanyHolidayCalendar,
      DeleteCompanyHolidayCalendarInput
    >({
      async queryFn(input, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: deleteCompanyHolidayCalendar,
          variables: { input },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as DeleteCompanyHolidayCalendarMutation | null;
        const deleted = data?.deleteCompanyHolidayCalendar;

        if (!deleted) {
          return {
            error: { message: "Failed to delete company holiday calendar" },
          };
        }

        return { data: deleted };
      },
      invalidatesTags: (result, _error, arg) => {
        const listTag: CalendarTag = {
          type: "CompanyHolidayCalendar",
          id: "LIST",
        };
        const targetId = arg.id ?? buildCalendarTagId(result ?? {});
        return [listTag, { type: "CompanyHolidayCalendar", id: targetId }];
      },
    }),
  }),
});

export const {
  useGetHolidayCalendarsQuery,
  useGetCompanyHolidayCalendarsQuery,
  useCreateHolidayCalendarMutation,
  useBulkCreateHolidayCalendarsMutation,
  useUpdateHolidayCalendarMutation,
  useDeleteHolidayCalendarMutation,
  useCreateCompanyHolidayCalendarMutation,
  useBulkCreateCompanyHolidayCalendarsMutation,
  useUpdateCompanyHolidayCalendarMutation,
  useDeleteCompanyHolidayCalendarMutation,
} = calendarApi;
