import { retryAsync } from "../retry";

describe("retryAsync", () => {
  it("成功するまで再試行し、結果を返すこと", async () => {
    const sleep = jest.fn(async () => undefined);
    const task = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce(new Error("temporary"))
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValue("ok");

    const result = await retryAsync(task, {
      maxAttempts: 3,
      baseDelayMs: 100,
      jitterRatio: 0,
      sleep,
    });

    expect(result).toBe("ok");
    expect(task).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenNthCalledWith(1, 100);
    expect(sleep).toHaveBeenNthCalledWith(2, 200);
  });

  it("shouldRetry が false のとき再試行しないこと", async () => {
    const task = jest
      .fn<Promise<string>, []>()
      .mockRejectedValue(new Error("bad request"));

    await expect(
      retryAsync(task, {
        maxAttempts: 3,
        baseDelayMs: 100,
        shouldRetry: () => false,
        sleep: async () => undefined,
      }),
    ).rejects.toThrow("bad request");

    expect(task).toHaveBeenCalledTimes(1);
  });

  it("ジッターを加味した遅延時間を計算できること", async () => {
    const sleep = jest.fn(async () => undefined);
    const task = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValue("ok");

    await retryAsync(task, {
      maxAttempts: 2,
      baseDelayMs: 100,
      jitterRatio: 0.5,
      random: () => 0.4,
      sleep,
    });

    // 100 + (100 * 0.5 * 0.4) = 120
    expect(sleep).toHaveBeenCalledWith(120);
  });
});
