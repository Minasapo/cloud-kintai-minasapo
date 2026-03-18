import type { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

import {
  EXPORT_MODEL_DEFINITIONS,
  type ExportModelDefinition,
} from "./exportRegistry";

const EXPORT_PAGE_SIZE = 200;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const nonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export type ExportedModelItem = Record<string, unknown>;

export type SingleExportPayload = {
  model: string;
  count: number;
  exportedAt: string;
  items: ExportedModelItem[];
};

export type BulkExportPayload = {
  exportedAt: string;
  modelCounts: Record<string, number>;
  models: Record<string, ExportedModelItem[]>;
};

export type ExportArtifact<TPayload> = {
  fileName: string;
  payload: TPayload;
};

export type BulkExportProgress = {
  completedModels: number;
  currentModelName: string;
  totalModels: number;
};

export async function fetchAllPages(
  definition: ExportModelDefinition
): Promise<ExportedModelItem[]> {
  const items: ExportedModelItem[] = [];
  let nextToken: string | null = null;

  do {
    const response = (await graphqlClient.graphql({
      query: definition.query,
      variables: {
        limit: EXPORT_PAGE_SIZE,
        nextToken,
      },
      authMode: "userPool",
    })) as GraphQLResult<Record<string, unknown>>;

    if (response.errors?.length) {
      throw new Error(response.errors[0]?.message || "GraphQL request failed");
    }

    const connection = definition.getConnection(response.data ?? null);
    if (!connection) {
      throw new Error(`${definition.modelName} の取得に失敗しました。`);
    }

    const pageItems = (connection.items ?? []).filter(
      (item): item is ExportedModelItem => isRecord(item) && nonNullable(item)
    );
    items.push(...pageItems);
    nextToken = connection.nextToken ?? null;
  } while (nextToken);

  return items;
}

export function formatExportTimestamp(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

export function buildExportFileName(
  scope: "all" | "single",
  modelName?: string,
  date = new Date()
) {
  const timestamp = formatExportTimestamp(date);
  if (scope === "all") {
    return `garaku-export-all-${timestamp}.json`;
  }

  return `garaku-export-${modelName || "unknown"}-${timestamp}.json`;
}

export function buildSingleExportPayload(
  modelName: string,
  items: ExportedModelItem[],
  exportedAt: string
): SingleExportPayload {
  return {
    model: modelName,
    count: items.length,
    exportedAt,
    items,
  };
}

export function buildBulkExportPayload(
  models: Record<string, ExportedModelItem[]>,
  exportedAt: string
): BulkExportPayload {
  const modelCounts = Object.fromEntries(
    Object.entries(models).map(([modelName, items]) => [modelName, items.length])
  );

  return {
    exportedAt,
    modelCounts,
    models,
  };
}

export async function createSingleExportArtifact(
  definition: ExportModelDefinition,
  date = new Date()
): Promise<ExportArtifact<SingleExportPayload>> {
  const items = await fetchAllPages(definition);
  const exportedAt = date.toISOString();

  return {
    fileName: buildExportFileName("single", definition.modelName, date),
    payload: buildSingleExportPayload(definition.modelName, items, exportedAt),
  };
}

export async function createBulkExportArtifact(
  definitions: ExportModelDefinition[] = EXPORT_MODEL_DEFINITIONS,
  date = new Date(),
  onProgress?: (progress: BulkExportProgress) => void
): Promise<ExportArtifact<BulkExportPayload>> {
  const models: Record<string, ExportedModelItem[]> = {};
  const totalModels = definitions.length;

  for (const [index, definition] of definitions.entries()) {
    onProgress?.({
      completedModels: index,
      currentModelName: definition.modelName,
      totalModels,
    });
    models[definition.modelName] = await fetchAllPages(definition);
  }

  const exportedAt = date.toISOString();

  return {
    fileName: buildExportFileName("all", undefined, date),
    payload: buildBulkExportPayload(models, exportedAt),
  };
}
