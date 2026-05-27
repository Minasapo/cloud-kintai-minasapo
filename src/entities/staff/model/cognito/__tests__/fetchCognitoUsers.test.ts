import { StaffRole } from "@entities/staff/lib/staffRoleMapping";
import { adminGet } from "@shared/api/amplify/adminQueriesClient";

import fetchCognitoUsers, {
  isRetryableListGroupsForUserError,
  mapAdminCognitoGroupsToRoles,
} from "../fetchCognitoUsers";

jest.mock("@shared/api/amplify/adminQueriesClient", () => ({
  adminGet: jest.fn(),
}));

const mockAdminGet = adminGet as jest.MockedFunction<typeof adminGet>;

const createMockUser = (sub: string) => ({
  Attributes: [
    { Name: "sub", Value: sub },
    { Name: "given_name", Value: "Taro" },
    { Name: "family_name", Value: "Yamada" },
    { Name: "email", Value: "taro@example.com" },
  ],
  Enabled: true,
  UserStatus: "CONFIRMED",
  UserCreateDate: "2024-01-01T00:00:00.000Z",
  UserLastModifiedDate: "2024-01-01T00:00:00.000Z",
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("mapAdminCognitoGroupsToRoles", () => {
  it("管理画面の group は未知値を None にフォールバックすること", () => {
    const roles = mapAdminCognitoGroupsToRoles([
      { GroupName: "Admin" },
      { GroupName: "UnknownGroup" },
    ]);

    expect(roles).toEqual([StaffRole.ADMIN, StaffRole.NONE]);
  });
});

describe("fetchCognitoUsers", () => {
  it("listGroupsForUser の同時実行数が上限を超えないこと", async () => {
    const users = Array.from({ length: 7 }, (_, index) =>
      createMockUser(`sub-${index + 1}`),
    );

    let activeCount = 0;
    let maxActiveCount = 0;

    mockAdminGet.mockImplementation(async (path) => {
      if (path === "/listUsers") {
        return { Users: users };
      }

      if (path === "/listGroupsForUser") {
        activeCount += 1;
        maxActiveCount = Math.max(maxActiveCount, activeCount);

        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });

        activeCount -= 1;
        return { Groups: [{ GroupName: "Admin" }] };
      }

      throw new Error("Unexpected path");
    });

    const result = await fetchCognitoUsers();

    expect(result).toHaveLength(7);
    expect(maxActiveCount).toBeLessThanOrEqual(4);
  });
});

describe("isRetryableListGroupsForUserError", () => {
  it("429 は再試行対象になること", () => {
    expect(isRetryableListGroupsForUserError({ statusCode: 429 })).toBe(true);
  });

  it("TooManyRequestsException は再試行対象になること", () => {
    expect(
      isRetryableListGroupsForUserError({
        name: "TooManyRequestsException",
      }),
    ).toBe(true);
  });

  it("5xx は再試行対象になること", () => {
    expect(
      isRetryableListGroupsForUserError({ response: { status: 503 } }),
    ).toBe(true);
  });

  it("ネットワーク系メッセージは再試行対象になること", () => {
    expect(
      isRetryableListGroupsForUserError(new Error("Failed to fetch")),
    ).toBe(true);
  });

  it("4xx は再試行対象外になること", () => {
    expect(isRetryableListGroupsForUserError({ statusCode: 400 })).toBe(false);
  });
});
