import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

import { EXPORT_MODEL_DEFINITIONS } from "./exportRegistry";
import {
  buildBulkExportPayload,
  buildExportFileName,
  buildSingleExportPayload,
  createBulkExportArtifact,
  createSingleExportArtifact,
  fetchAllPages,
  formatExportTimestamp,
} from "./exportService";

jest.mock("@/shared/api/amplify/graphqlClient", () => ({
  graphqlClient: {
    graphql: jest.fn(),
  },
}));

const mockedGraphql = graphqlClient.graphql as jest.Mock;

describe("exportRegistry", () => {
  it("contains all @model-based export targets", () => {
    expect(EXPORT_MODEL_DEFINITIONS.map((definition) => definition.modelName)).toEqual([
      "CheckForUpdate",
      "AppConfig",
      "Staff",
      "HolidayCalendar",
      "CompanyHolidayCalendar",
      "EventCalendar",
      "CloseDate",
      "Attendance",
      "Document",
      "ShiftRequest",
      "ShiftPlanYear",
      "Workflow",
      "WorkflowTemplate",
      "WorkflowNotificationEvent",
      "OperationLog",
      "AuditLog",
      "DailyReport",
    ]);
  });
});

describe("exportService", () => {
  beforeEach(() => {
    mockedGraphql.mockReset();
  });

  const localDate = new Date(2026, 2, 17, 1, 2, 3);

  it("fetchAllPages concatenates paginated items", async () => {
    const definition = EXPORT_MODEL_DEFINITIONS.find(
      (item) => item.modelName === "Staff"
    );

    mockedGraphql
      .mockResolvedValueOnce({
        data: {
          listStaff: {
            items: [{ id: "staff-1" }],
            nextToken: "token-1",
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          listStaff: {
            items: [{ id: "staff-2" }, null],
            nextToken: null,
          },
        },
      });

    await expect(fetchAllPages(definition!)).resolves.toEqual([
      { id: "staff-1" },
      { id: "staff-2" },
    ]);
  });

  it("fails when a page request returns graphql errors", async () => {
    const definition = EXPORT_MODEL_DEFINITIONS.find(
      (item) => item.modelName === "Staff"
    );

    mockedGraphql.mockResolvedValue({
      errors: [{ message: "boom" }],
    });

    await expect(fetchAllPages(definition!)).rejects.toThrow("boom");
  });

  it("builds single export payload and file name", async () => {
    const definition = EXPORT_MODEL_DEFINITIONS.find(
      (item) => item.modelName === "Staff"
    );
    const date = localDate;

    mockedGraphql.mockResolvedValue({
      data: {
        listStaff: {
          items: [{ id: "staff-1" }],
          nextToken: null,
        },
      },
    });

    const artifact = await createSingleExportArtifact(definition!, date);

    expect(artifact.fileName).toBe("garaku-export-Staff-20260317-010203.json");
    expect(artifact.payload).toEqual({
      model: "Staff",
      count: 1,
      exportedAt: date.toISOString(),
      items: [{ id: "staff-1" }],
    });
  });

  it("builds bulk export payload with model counts", async () => {
    const date = localDate;
    const definitions = EXPORT_MODEL_DEFINITIONS.filter((definition) =>
      ["Staff", "AppConfig"].includes(definition.modelName)
    );

    mockedGraphql
      .mockResolvedValueOnce({
        data: {
          listAppConfigs: {
            items: [{ id: "config-1" }],
            nextToken: null,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          listStaff: {
            items: [],
            nextToken: null,
          },
        },
      });

    const artifact = await createBulkExportArtifact(definitions, date);

    expect(artifact.fileName).toBe("garaku-export-all-20260317-010203.json");
    expect(artifact.payload).toEqual({
      exportedAt: date.toISOString(),
      modelCounts: {
        AppConfig: 1,
        Staff: 0,
      },
      models: {
        AppConfig: [{ id: "config-1" }],
        Staff: [],
      },
    });
  });

  it("supports pure payload and timestamp helpers", () => {
    expect(formatExportTimestamp(localDate)).toBe("20260317-010203");
    expect(buildExportFileName("all", undefined, localDate)).toBe(
      "garaku-export-all-20260317-010203.json"
    );
    expect(
      buildSingleExportPayload("Staff", [], "2026-03-17T01:02:03.000Z")
    ).toEqual({
      model: "Staff",
      count: 0,
      exportedAt: "2026-03-17T01:02:03.000Z",
      items: [],
    });
    expect(
      buildBulkExportPayload(
        { Staff: [{ id: "1" }], AppConfig: [] },
        "2026-03-17T01:02:03.000Z"
      )
    ).toEqual({
      exportedAt: "2026-03-17T01:02:03.000Z",
      modelCounts: { Staff: 1, AppConfig: 0 },
      models: { Staff: [{ id: "1" }], AppConfig: [] },
    });
  });
});
