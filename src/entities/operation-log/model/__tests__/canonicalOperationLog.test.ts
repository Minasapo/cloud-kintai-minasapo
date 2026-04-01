import { getCurrentUser } from "aws-amplify/auth";

import {
  buildCanonicalOperationLogInput,
  normalizeOperationLogAction,
  normalizeOperationLogValue,
} from "../canonicalOperationLog";

jest.mock("aws-amplify/auth", () => ({
  getCurrentUser: jest.fn(),
}));

const getCurrentUserMock = getCurrentUser as jest.Mock;

describe("canonicalOperationLog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({
      userId: "actor-cognito-id",
      username: "actor-user",
    });
  });

  it("normalizes objects by removing undefined and __typename while preserving null", () => {
    expect(
      normalizeOperationLogValue({
        b: 2,
        a: 1,
        nested: {
          keep: null,
          omit: undefined,
          __typename: "Nested",
        },
        __typename: "Root",
      }),
    ).toEqual({
      a: 1,
      b: 2,
      nested: {
        keep: null,
      },
    });
  });

  it("builds canonical input with normalized before/after/diff payloads", async () => {
    const input = await buildCanonicalOperationLogInput({
      action: "clock_in",
      resource: "attendance",
      resourceId: "attendance-1",
      before: {
        startTime: null,
        __typename: "Attendance",
      },
      after: {
        startTime: "2026-03-31T09:00:00.000Z",
        rests: [undefined, { startTime: "2026-03-31T12:00:00.000Z" }],
      },
      appVersion: "test-version",
      clientTimezone: "Asia/Tokyo",
      summary: "override summary",
    });

    expect(normalizeOperationLogAction("clock_in")).toBe("attendance.clock_in");
    expect(input.staffId).toBe("actor-cognito-id");
    expect(input.resourceKey).toBe("attendance#attendance-1");
    expect(input.action).toBe("attendance.clock_in");
    expect(input.summary).toBe("override summary");
    expect(input.logFormatVersion).toBe(1);
    expect(input.before).toBe(JSON.stringify({ startTime: null }));
    expect(input.after).toBe(
      JSON.stringify({
        rests: [null, { startTime: "2026-03-31T12:00:00.000Z" }],
        startTime: "2026-03-31T09:00:00.000Z",
      }),
    );
    expect(input.diff).toBe(
      JSON.stringify({
        after: {
          rests: [null, { startTime: "2026-03-31T12:00:00.000Z" }],
          startTime: "2026-03-31T09:00:00.000Z",
        },
        before: { startTime: null },
        mode: "full",
      }),
    );
  });
});
