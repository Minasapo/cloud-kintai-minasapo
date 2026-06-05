import {
  mapStaffRoleFromCognitoGroup,
  StaffRole,
} from "@entities/staff/lib/staffRoleMapping";
import { Staff } from "@entities/staff/model/useStaffs/common";
import { adminGet } from "@shared/api/amplify/adminQueriesClient";
import { createLogger } from "@shared/lib/logger";
import { retryAsync } from "@shared/lib/retry";
import dayjs from "dayjs";

import * as MESSAGE_CODE from "@/errors";

type CognitoUserAttribute = {
  Name?: string;
  Value?: string;
};

type ListUsersUser = {
  Attributes?: CognitoUserAttribute[];
  Enabled?: boolean;
  UserStatus?: string;
  UserCreateDate?: string;
  UserLastModifiedDate?: string;
};

type ListUsersResponse = {
  Users?: ListUsersUser[];
};

type CognitoGroup = {
  GroupName?: string;
};

type ListGroupsForUserResponse = {
  Groups?: CognitoGroup[];
};

// Cognito AdminQueries の瞬間的なスパイクを避けるため同時実行数を制御する
const LIST_GROUPS_FOR_USER_MAX_CONCURRENCY = 4;
const LIST_GROUPS_FOR_USER_RETRY_ATTEMPTS = 3;
const LIST_GROUPS_FOR_USER_RETRY_BASE_DELAY_MS = 300;
const LIST_GROUPS_FOR_USER_RETRY_MAX_DELAY_MS = 1500;
const LIST_GROUPS_FOR_USER_RETRY_JITTER_RATIO = 0.2;
const logger = createLogger("fetchCognitoUsers");

const NETWORK_ERROR_MESSAGES = [
  "network error",
  "failed to fetch",
  "fetch failed",
  "timeout",
];

const RETRYABLE_ERROR_NAMES = [
  "toomanyrequestsexception",
  "throttlingexception",
  "serviceunavailableexception",
  "internalfailure",
  "internalerrorexception",
];

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const extractHttpStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const maybeError = error as {
    status?: unknown;
    statusCode?: unknown;
    $metadata?: { httpStatusCode?: unknown };
    response?: { status?: unknown; statusCode?: unknown };
  };

  if (isNumber(maybeError.statusCode)) {
    return maybeError.statusCode;
  }

  if (isNumber(maybeError.status)) {
    return maybeError.status;
  }

  if (isNumber(maybeError.$metadata?.httpStatusCode)) {
    return maybeError.$metadata.httpStatusCode;
  }

  if (isNumber(maybeError.response?.statusCode)) {
    return maybeError.response.statusCode;
  }

  if (isNumber(maybeError.response?.status)) {
    return maybeError.response.status;
  }

  return undefined;
};

const extractErrorName = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const maybeError = error as {
    name?: unknown;
    code?: unknown;
    __type?: unknown;
  };

  if (typeof maybeError.name === "string") {
    return maybeError.name.toLowerCase();
  }

  if (typeof maybeError.code === "string") {
    return maybeError.code.toLowerCase();
  }

  if (typeof maybeError.__type === "string") {
    return maybeError.__type.toLowerCase();
  }

  return undefined;
};

export const isRetryableListGroupsForUserError = (error: unknown): boolean => {
  const status = extractHttpStatus(error);

  if (status === 429) {
    return true;
  }

  if (typeof status === "number" && status >= 500 && status <= 599) {
    return true;
  }

  const errorName = extractErrorName(error);
  if (
    typeof errorName === "string" &&
    RETRYABLE_ERROR_NAMES.some((name) => errorName.includes(name))
  ) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return NETWORK_ERROR_MESSAGES.some((text) => message.includes(text));
};

const mapWithConcurrencyLimit = async <T, R>(
  items: readonly T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const runWorker = async () => {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  };

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));

  return results;
};

export function mapAdminCognitoGroupsToRoles(
  groups: readonly CognitoGroup[],
): StaffRole[] {
  return groups.map((group) =>
    mapStaffRoleFromCognitoGroup(group.GroupName, { fallback: StaffRole.NONE }),
  );
}

export default async function fetchCognitoUsers(): Promise<Staff[]> {
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await adminGet<ListUsersResponse>(
    "/listUsers",
    params,
  ).catch((error) => {
    logger.error("Failed to list Cognito users", {
      phase: "listUsers",
      status: extractHttpStatus(error),
    });
    throw error;
  });
  const users = response?.Users ?? [];

  return await mapWithConcurrencyLimit(
    users,
    async (user) => {
      const attributes = user.Attributes ?? [];
      const sub = attributes.find((attr) => attr.Name === "sub")?.Value;

      if (!sub) {
        logger.error("Cognito user has no sub attribute", {
          phase: "validateAttributes",
        });
        throw new Error(MESSAGE_CODE.E05007);
      }

      const adminResponse = await retryAsync(
        () =>
          adminGet<ListGroupsForUserResponse>("/listGroupsForUser", {
            ...params,
            queryStringParameters: {
              username: sub,
            },
          }),
        {
          maxAttempts: LIST_GROUPS_FOR_USER_RETRY_ATTEMPTS,
          baseDelayMs: LIST_GROUPS_FOR_USER_RETRY_BASE_DELAY_MS,
          maxDelayMs: LIST_GROUPS_FOR_USER_RETRY_MAX_DELAY_MS,
          jitterRatio: LIST_GROUPS_FOR_USER_RETRY_JITTER_RATIO,
          shouldRetry: isRetryableListGroupsForUserError,
          onRetry: ({ attempt, delayMs, error }) => {
            logger.warn("Retrying listGroupsForUser", {
              phase: "listGroupsForUser",
              sub,
              attempt,
              maxAttempts: LIST_GROUPS_FOR_USER_RETRY_ATTEMPTS,
              delayMs,
              status: extractHttpStatus(error),
            });
          },
        },
      ).catch((error) => {
        logger.error("Failed to fetch Cognito groups after retries", {
          phase: "listGroupsForUser",
          sub,
          maxAttempts: LIST_GROUPS_FOR_USER_RETRY_ATTEMPTS,
          status: extractHttpStatus(error),
        });
        throw new Error(MESSAGE_CODE.E05008);
      });

      const groups = adminResponse?.Groups ?? [];

      // 権限
      if (groups.length === 0) {
        logger.error("No Cognito groups found for user", {
          phase: "validateGroups",
          sub,
        });
        throw new Error(MESSAGE_CODE.E05008);
      }

      const roles = mapAdminCognitoGroupsToRoles(groups);

      // オーナー権限
      const ownerAttribute = attributes.find(
        (attr) => attr.Name === "custom:owner",
      );

      const owner = (() => {
        const flag = ownerAttribute ? Number(ownerAttribute.Value) : 0;
        return Boolean(flag);
      })();

      return {
        sub,
        enabled: Boolean(user.Enabled),
        status: user.UserStatus ?? "",
        givenName: attributes.find((attr) => attr.Name === "given_name")?.Value,
        familyName: attributes.find((attr) => attr.Name === "family_name")
          ?.Value,
        mailAddress: attributes.find((attr) => attr.Name === "email")?.Value,
        owner,
        roles,
        createdAt: dayjs(user.UserCreateDate as string),
        updatedAt: dayjs(user.UserLastModifiedDate as string),
      } as Staff;
    },
    LIST_GROUPS_FOR_USER_MAX_CONCURRENCY,
  );
}
