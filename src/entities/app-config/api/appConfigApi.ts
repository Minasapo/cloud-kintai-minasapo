import { createApi } from "@reduxjs/toolkit/query/react";
import {
  createAppConfig,
  updateAppConfig,
} from "@shared/api/graphql/documents/mutations";
import { listAppConfigs } from "@shared/api/graphql/documents/queries";
import { graphqlBaseQuery } from "@shared/api/graphql/graphqlBaseQuery";
import type {
  AppConfig,
  CreateAppConfigInput,
  CreateAppConfigMutation,
  ListAppConfigsQuery,
  UpdateAppConfigInput,
  UpdateAppConfigMutation,
} from "@shared/api/graphql/types";

const nonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export const appConfigApi = createApi({
  reducerPath: "appConfigApi",
  baseQuery: graphqlBaseQuery(),
  tagTypes: ["AppConfig"],
  endpoints: (builder) => ({
    getAppConfig: builder.query<AppConfig | null, { name?: string } | void>({
      async queryFn(arg, _queryApi, _extraOptions, baseQuery) {
        const name = arg?.name ?? "default";
        const result = await baseQuery({
          document: listAppConfigs,
          variables: {
            filter: { name: { eq: name } },
          },
          authMode: "apiKey",
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as ListAppConfigsQuery | null;
        const items = data?.listAppConfigs?.items?.filter(nonNullable) ?? [];

        if (items.length > 1) {
          return { error: { message: "Multiple app configs found" } };
        }

        return { data: items[0] ?? null };
      },
      providesTags: (result) => {
        const baseTag = { type: "AppConfig" as const, id: "LIST" };
        if (!result) {
          return [baseTag];
        }

        return [
          baseTag,
          { type: "AppConfig" as const, id: result.id ?? "UNKNOWN" },
        ];
      },
    }),
    createAppConfig: builder.mutation<AppConfig, CreateAppConfigInput>({
      async queryFn(input, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: createAppConfig,
          variables: { input },
          authMode: "apiKey",
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as CreateAppConfigMutation | null;
        const created = data?.createAppConfig;

        if (!created) {
          return { error: { message: "Failed to create app config" } };
        }

        return { data: created };
      },
      invalidatesTags: [{ type: "AppConfig", id: "LIST" }],
    }),
    updateAppConfig: builder.mutation<AppConfig, UpdateAppConfigInput>({
      async queryFn(input, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: updateAppConfig,
          variables: { input },
          authMode: "apiKey",
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as UpdateAppConfigMutation | null;
        const updated = data?.updateAppConfig;

        if (!updated) {
          return { error: { message: "Failed to update app config" } };
        }

        return { data: updated };
      },
      invalidatesTags: (result) => {
        if (!result) {
          return [{ type: "AppConfig", id: "LIST" }];
        }

        return [
          { type: "AppConfig", id: "LIST" },
          { type: "AppConfig", id: result.id ?? "UNKNOWN" },
        ];
      },
    }),
  }),
});

export const {
  useGetAppConfigQuery,
  useCreateAppConfigMutation,
  useUpdateAppConfigMutation,
} = appConfigApi;
