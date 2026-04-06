import type { OperationLog } from "@shared/api/graphql/types";

import {
  hasNullableResourceKeyError,
  normalizeLegacyOperationLog,
  parseOperationLogJsonLike,
} from "../operationLogLegacyCompatibility";

const baseLog: OperationLog = {
  __typename: "OperationLog",
  id: "log-1",
  action: "attendance.update",
  timestamp: "2026-04-01T00:00:00.000Z",
  resource: "attendance",
  resourceId: "attendance-1",
  resourceKey: "attendance#attendance-1",
  logFormatVersion: 1,
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
};

describe("operationLogLegacyCompatibility", () => {
  it("detects nullable resourceKey GraphQL errors", () => {
    expect(
      hasNullableResourceKeyError([
        {
          message:
            "Cannot return null for non-nullable type: 'String' within parent 'OperationLog'",
        },
      ]),
    ).toBe(true);
  });

  it("normalizes legacy log fields", () => {
    const normalized = normalizeLegacyOperationLog({
      ...baseLog,
      resourceKey: "",
      details: { summary: "x" } as unknown as string,
      metadata: { source: "legacy" } as unknown as string,
    });

    expect(normalized.resourceKey).toBe("attendance#attendance-1");
    expect(normalized.details).toBe('{"summary":"x"}');
    expect(normalized.metadata).toBe('{"source":"legacy"}');
  });

  it("parses JSON-like values from string and object", () => {
    expect(parseOperationLogJsonLike('{"x":1}')).toEqual({ x: 1 });
    expect(parseOperationLogJsonLike({ x: 1 })).toEqual({ x: 1 });
    expect(parseOperationLogJsonLike("invalid json")).toBeNull();
  });
});
