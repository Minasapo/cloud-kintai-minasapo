import { act, renderHook } from "@testing-library/react";

import { useDuplicateAttendanceWarning } from "../useDuplicateAttendanceWarning";

jest.mock("@app/hooks", () => ({
  useAppDispatchV2: jest.fn(),
}));

jest.mock("@/app/slices/snackbarSlice", () => ({
  setSnackbarError: jest.fn((message: string) => ({
    type: "snackbar/setError",
    payload: message,
  })),
}));

describe("useDuplicateAttendanceWarning", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    const { useAppDispatchV2 } = jest.requireMock("@app/hooks");
    useAppDispatchV2.mockReturnValue(dispatch);
  });

  it("カスタムイベントを受信するとスナックバーエラーをdispatchする", () => {
    const { unmount } = renderHook(() => useDuplicateAttendanceWarning());
    const { setSnackbarError } = jest.requireMock(
      "@/app/slices/snackbarSlice"
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent("attendance-duplicate-warning", {
          detail: { message: "duplicate" },
        })
      );
    });

    expect(dispatch).toHaveBeenCalledWith(setSnackbarError("duplicate"));

    unmount();
  });

  it("アンマウント後はイベントを無視する", () => {
    const { unmount } = renderHook(() => useDuplicateAttendanceWarning());
    const { setSnackbarError } = jest.requireMock(
      "@/app/slices/snackbarSlice"
    );

    unmount();

    act(() => {
      window.dispatchEvent(
        new CustomEvent("attendance-duplicate-warning", {
          detail: { message: "ignored" },
        })
      );
    });

    expect(dispatch).not.toHaveBeenCalledWith(setSnackbarError("ignored"));
  });
});
