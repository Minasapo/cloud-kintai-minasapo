import { act, renderHook } from "@testing-library/react";

import { pushNotification } from "@/shared/lib/store/notificationSlice";

import { useDuplicateAttendanceWarning } from "./useDuplicateAttendanceWarning";

jest.mock("@app/hooks", () => ({
  useAppDispatchV2: jest.fn(),
}));

describe("useDuplicateAttendanceWarning", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    const { useAppDispatchV2 } = jest.requireMock("@app/hooks");
    useAppDispatchV2.mockReturnValue(dispatch);
  });

  it("カスタムイベントを受信すると通知を dispatch する", () => {
    const { unmount } = renderHook(() => useDuplicateAttendanceWarning());

    act(() => {
      window.dispatchEvent(
        new CustomEvent("attendance-duplicate-warning", {
          detail: { message: "duplicate" },
        }),
      );
    });

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: pushNotification({
          tone: "error",
          message: "duplicate",
        }).type,
        payload: expect.objectContaining({
          tone: "error",
          message: "duplicate",
          placement: "top-right",
          source: "global",
        }),
      }),
    );

    unmount();
  });

  it("アンマウント後はイベントを無視する", () => {
    const { unmount } = renderHook(() => useDuplicateAttendanceWarning());

    unmount();

    act(() => {
      window.dispatchEvent(
        new CustomEvent("attendance-duplicate-warning", {
          detail: { message: "ignored" },
        }),
      );
    });

    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          tone: "error",
          message: "ignored",
        }),
      }),
    );
  });
});
