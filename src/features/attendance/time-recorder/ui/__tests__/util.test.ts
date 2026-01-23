import dayjs from "dayjs";

import { getNowISOStringWithZeroSeconds } from "../../lib/util";

jest.mock("dayjs");

describe("getNowISOStringWithZeroSeconds", () => {
  it("should return ISO string with seconds and milliseconds set to zero", () => {
    // モックした日付: 2024-06-01T12:34:56.789Z
    const mockDate = {
      second: jest.fn().mockReturnThis(),
      millisecond: jest.fn().mockReturnThis(),
      toISOString: jest.fn().mockReturnValue("2024-06-01T12:34:00.000Z"),
    };
    (dayjs as unknown as jest.Mock).mockReturnValue(mockDate);

    const result = getNowISOStringWithZeroSeconds();
    expect(mockDate.second).toHaveBeenCalledWith(0);
    expect(mockDate.millisecond).toHaveBeenCalledWith(0);
    expect(result).toBe("2024-06-01T12:34:00.000Z");
  });
});
