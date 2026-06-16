import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { renderHook, waitFor } from "@testing-library/react";

import { usePersonalExternalLinks } from "../usePersonalExternalLinks";

jest.mock("@entities/staff/model/useStaff/fetchStaff", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@shared/lib/logger", () => ({
  ...(() => {
    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    return {
      __mockLogger: mockLogger,
      createLogger: jest.fn(() => mockLogger),
    };
  })(),
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

const mockFetchStaff = fetchStaff as jest.MockedFunction<typeof fetchStaff>;

const createExternalLink = (overrides?: Partial<{ label: string; url: string }>) => ({
  enabled: true,
  icon: "LinkIcons",
  label: "個人リンク",
  url: "https://example.com",
  ...overrides,
});

describe("usePersonalExternalLinks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("取得成功時に有効な個人リンクのみを返す", async () => {
    mockFetchStaff.mockResolvedValue({
      externalLinks: [
        createExternalLink({ label: " Link A ", url: " https://a.example.com " }),
        createExternalLink({ label: "", url: "https://invalid.example.com" }),
        { ...createExternalLink(), enabled: false },
      ],
    } as never);

    const { result } = renderHook(() => usePersonalExternalLinks("user-1"));

    await waitFor(() => {
      expect(result.current.personalLinks).toHaveLength(1);
    });

    expect(result.current.personalLinks[0]).toMatchObject({
      enabled: true,
      icon: "LinkIcons",
      isPersonal: true,
      label: "Link A",
      url: "https://a.example.com",
    });
    expect(result.current.hasFetchError).toBe(false);
  });

  it("再取得中に既存リンク表示を維持する", async () => {
    const secondRequest = createDeferred<unknown>();

    mockFetchStaff
      .mockResolvedValueOnce({
        externalLinks: [createExternalLink({ label: "First" })],
      } as never)
      .mockReturnValueOnce(secondRequest.promise as never);

    const { result, rerender } = renderHook(
      ({ userId }: { userId: string | undefined }) =>
        usePersonalExternalLinks(userId),
      { initialProps: { userId: "user-1" } },
    );

    await waitFor(() => {
      expect(result.current.personalLinks).toHaveLength(1);
    });

    rerender({ userId: "user-2" });
    expect(result.current.personalLinks).toHaveLength(1);
    expect(result.current.personalLinks[0].label).toBe("First");

    secondRequest.resolve({
      externalLinks: [createExternalLink({ label: "Second" })],
    });

    await waitFor(() => {
      expect(result.current.personalLinks[0].label).toBe("Second");
    });
  });

  it("取得失敗時にリンクを保持したままエラーを観測できる", async () => {
    const requestError = new Error("network failed");
    const secondRequest = createDeferred<unknown>();

    mockFetchStaff
      .mockResolvedValueOnce({
        externalLinks: [createExternalLink({ label: "First" })],
      } as never)
      .mockReturnValueOnce(secondRequest.promise as never);

    const { result, rerender } = renderHook(
      ({ userId }: { userId: string | undefined }) =>
        usePersonalExternalLinks(userId),
      { initialProps: { userId: "user-1" } },
    );

    await waitFor(() => {
      expect(result.current.personalLinks[0].label).toBe("First");
    });

    rerender({ userId: "user-2" });
    secondRequest.reject(requestError);

    await waitFor(() => {
      expect(result.current.hasFetchError).toBe(true);
    });

    const loggerModule = jest.requireMock("@shared/lib/logger") as {
      __mockLogger: { error: jest.Mock };
    };

    expect(result.current.personalLinks[0].label).toBe("First");
    expect(loggerModule.__mockLogger.error).toHaveBeenCalledWith(
      "Failed to fetch personal external links",
      {
        cognitoUserId: "user-2",
        error: requestError,
      },
    );
  });
});
