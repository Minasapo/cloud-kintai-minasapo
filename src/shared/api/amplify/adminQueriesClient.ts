import type { DocumentType } from "@aws-amplify/core/internals/utils";
import { get, post } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";

type LegacyRestOptions = {
  headers?: Record<string, string>;
  body?: DocumentType | FormData;
  queryStringParameters?: Record<string, string | number | boolean | undefined>;
};

type RestOptions = Omit<LegacyRestOptions, "queryStringParameters"> & {
  queryParams?: Record<string, string>;
};

type RestResponse = Awaited<ReturnType<typeof get>["response"]>;

const ADMIN_API_NAME = "AdminQueries";

const buildAuthorizationHeader = async (): Promise<string> => {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();

  if (!token) {
    throw new Error("アクセストークンの取得に失敗しました。");
  }

  return token;
};

const normalizeQueryParams = (
  params?: LegacyRestOptions["queryStringParameters"]
) => {
  if (!params) {
    return undefined;
  }

  const normalized = Object.entries(params).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (typeof value === "undefined") {
        return acc;
      }
      acc[key] = String(value);
      return acc;
    },
    {}
  );

  return Object.keys(normalized).length ? normalized : undefined;
};

const toRestOptions = async (
  options?: LegacyRestOptions
): Promise<RestOptions | undefined> => {
  if (!options) {
    const authorization = await buildAuthorizationHeader();
    return { headers: { Authorization: authorization } };
  }

  const authorization = await buildAuthorizationHeader();
  const headers = {
    ...(options.headers ?? {}),
    Authorization: authorization,
  };

  const restOptions: RestOptions = {
    ...options,
    headers,
  };

  const queryParams = normalizeQueryParams(options.queryStringParameters);
  if (queryParams) {
    restOptions.queryParams = queryParams;
  }

  delete (restOptions as { queryStringParameters?: unknown })
    .queryStringParameters;

  return restOptions;
};

const parseResponseBody = async <T>(response: RestResponse): Promise<T> => {
  const { body } = response;

  if (!body) {
    return undefined as T;
  }

  try {
    return (await body.json()) as T;
  } catch {
    return undefined as T;
  }
};

export const adminPost = async <T = unknown>(
  path: string,
  options?: LegacyRestOptions
): Promise<T> => {
  const restOperation = post({
    apiName: ADMIN_API_NAME,
    path,
    options: await toRestOptions(options),
  });

  return parseResponseBody<T>(await restOperation.response);
};

export const adminGet = async <T = unknown>(
  path: string,
  options?: LegacyRestOptions
): Promise<T> => {
  const restOperation = get({
    apiName: ADMIN_API_NAME,
    path,
    options: await toRestOptions(options),
  });

  return parseResponseBody<T>(await restOperation.response);
};
