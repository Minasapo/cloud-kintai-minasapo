import { Storage } from "aws-amplify";

type ShiftPatternStorageRecord = {
  id: string;
  name: string;
  mapping: Record<string, string>;
};

const STORAGE_LEVEL = "private" as const;
const STORAGE_KEY = "shift-request/patterns.json";

const isNotFoundError = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const maybeError = error as {
    name?: string;
    code?: string | number;
    statusCode?: number;
    $metadata?: { httpStatusCode?: number };
  };

  if (maybeError.name === "NoSuchKey") {
    return true;
  }

  if (maybeError.code === "NotFound" || maybeError.statusCode === 404) {
    return true;
  }

  if (maybeError.$metadata?.httpStatusCode === 404) {
    return true;
  }

  return false;
};

const parseBodyText = async (body: unknown) => {
  if (!body) {
    return "";
  }

  if (typeof body === "string") {
    return body;
  }

  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return body.text();
  }

  if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) {
    return new TextDecoder().decode(body);
  }

  if (body instanceof Uint8Array) {
    return new TextDecoder().decode(body);
  }

  if (typeof (body as { text?: () => Promise<string> }).text === "function") {
    return (body as { text: () => Promise<string> }).text();
  }

  return "";
};

const parseResponseBody = async (body: unknown) => {
  const text = await parseBodyText(body);
  if (!text) {
    return [] as ShiftPatternStorageRecord[];
  }

  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      return [] as ShiftPatternStorageRecord[];
    }
    return data as ShiftPatternStorageRecord[];
  } catch (error) {
    console.error("Failed to parse shift patterns", error);
    return [] as ShiftPatternStorageRecord[];
  }
};

export const loadShiftPatterns = async (): Promise<
  ShiftPatternStorageRecord[]
> => {
  try {
    const result = await Storage.get(STORAGE_KEY, {
      level: STORAGE_LEVEL,
      download: true,
    });
    return await parseResponseBody((result as { Body?: unknown })?.Body);
  } catch (error) {
    if (isNotFoundError(error)) {
      return [];
    }
    throw error;
  }
};

export const saveShiftPatterns = async (
  patterns: ShiftPatternStorageRecord[]
): Promise<void> => {
  await Storage.put(STORAGE_KEY, JSON.stringify(patterns), {
    level: STORAGE_LEVEL,
    contentType: "application/json",
  });
};

export type { ShiftPatternStorageRecord };
