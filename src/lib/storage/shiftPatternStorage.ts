import { downloadData, uploadData } from "aws-amplify/storage";

import { createLogger } from "@/lib/logger";

const logger = createLogger("shiftPatternStorage");

type ShiftPatternStorageRecord = {
  id: string;
  name: string;
  mapping: Record<string, string>;
};

const STORAGE_LEVEL = "private" as const;
const STORAGE_KEY = "shift-request/patterns.json";

type DownloadResult = Awaited<ReturnType<typeof downloadData>>;
type DownloadBody = Awaited<DownloadResult["result"]>["body"] | undefined;

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

const parseBodyText = async (body: DownloadBody) => {
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

const parseResponseBody = async (body: DownloadBody) => {
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
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Failed to parse shift patterns:", message);
    return [] as ShiftPatternStorageRecord[];
  }
};

export const loadShiftPatterns = async (): Promise<
  ShiftPatternStorageRecord[]
> => {
  try {
    const downloadResult = await downloadData({
      key: STORAGE_KEY,
      options: {
        accessLevel: STORAGE_LEVEL,
      },
    });
    const { body } = await downloadResult.result;
    return await parseResponseBody(body);
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
  const uploadTask = await uploadData({
    key: STORAGE_KEY,
    data: JSON.stringify(patterns),
    options: {
      accessLevel: STORAGE_LEVEL,
      contentType: "application/json",
    },
  });

  await uploadTask.result;
};

export type { ShiftPatternStorageRecord };
