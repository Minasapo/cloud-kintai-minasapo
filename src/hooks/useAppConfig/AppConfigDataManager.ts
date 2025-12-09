import { GraphQLResult } from "@aws-amplify/api";
import {
  createAppConfig,
  updateAppConfig,
} from "@shared/api/graphql/documents/mutations";
import { listAppConfigs } from "@shared/api/graphql/documents/queries";
import { API } from "aws-amplify";

import {
  AppConfig,
  CreateAppConfigInput,
  CreateAppConfigMutation,
  ListAppConfigsQuery,
  UpdateAppConfigInput,
  UpdateAppConfigMutation,
} from "@/API";

export class AppConfigDataManager {
  async fetch(name: string = "default") {
    const response = (await API.graphql({
      query: listAppConfigs,
      variables: { filter: { name: { eq: name } } },
      authMode: "API_KEY",
    })) as GraphQLResult<ListAppConfigsQuery>;

    if (response.errors) {
      throw new Error(response.errors[0].message);
    }

    if (!response.data?.listAppConfigs) {
      throw new Error("Failed to fetch app config");
    }

    const appConfigs: AppConfig[] = response.data.listAppConfigs.items.filter(
      (item): item is NonNullable<typeof item> => item !== null
    );

    // 1件以上のデータがある場合は、エラーを投げる
    if (appConfigs.length > 1) {
      throw new Error("Multiple app configs found");
    }

    return appConfigs[0] || null;
  }

  async create(input: CreateAppConfigInput) {
    const response = (await API.graphql({
      query: createAppConfig,
      variables: { input },
      authMode: "API_KEY",
    })) as GraphQLResult<CreateAppConfigMutation>;

    if (response.errors) {
      throw new Error(response.errors[0].message);
    }

    if (!response.data?.createAppConfig) {
      throw new Error("Failed to create app config");
    }

    const appConfig: AppConfig = response.data.createAppConfig;
    return appConfig;
  }

  async update(input: UpdateAppConfigInput) {
    const response = (await API.graphql({
      query: updateAppConfig,
      variables: { input },
      authMode: "API_KEY",
    })) as GraphQLResult<UpdateAppConfigMutation>;

    if (response.errors) {
      throw new Error(response.errors[0].message);
    }

    if (!response.data?.updateAppConfig) {
      throw new Error("Failed to update app config");
    }

    const appConfig: AppConfig = response.data.updateAppConfig;
    return appConfig;
  }
}
