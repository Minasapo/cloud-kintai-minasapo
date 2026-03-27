import { act, fireEvent, render, screen, within } from "@testing-library/react";

import {
  setSnackbarError,
  setSnackbarSuccess,
  setSnackbarWarn,
} from "@/shared/lib/store/snackbarSlice";

import SnackbarGroup from "./SnackbarGroup";

const mockDispatch = jest.fn();
const mockUseAppDispatchV2 = jest.fn();
const mockUseAppSelectorV2 = jest.fn();

jest.mock("@/app/hooks", () => ({
  useAppDispatchV2: () => mockUseAppDispatchV2(),
  useAppSelectorV2: (selector: (state: unknown) => unknown) =>
    mockUseAppSelectorV2(selector),
}));

describe("SnackbarGroup", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockDispatch.mockReset();
    mockUseAppDispatchV2.mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("success / error / warning をスタック表示する", () => {
    mockUseAppSelectorV2.mockImplementation((selector) =>
      selector({
        snackbar: {
          success: "保存しました",
          error: "保存に失敗しました",
          warn: "注意してください",
        },
      }),
    );

    render(<SnackbarGroup />);

    expect(screen.getByText("保存しました")).toBeInTheDocument();
    expect(screen.getByText("保存に失敗しました")).toBeInTheDocument();
    expect(screen.getByText("注意してください")).toBeInTheDocument();
  });

  it("Close notification クリックで対応する state clear action を dispatch する", () => {
    mockUseAppSelectorV2.mockImplementation((selector) =>
      selector({
        snackbar: {
          success: null,
          error: "保存に失敗しました",
          warn: null,
        },
      }),
    );

    render(<SnackbarGroup />);

    const alert = screen.getByText("保存に失敗しました").closest("[role='alert']");
    if (!alert) {
      throw new Error("Alert element not found");
    }

    fireEvent.click(
      within(alert as HTMLElement).getByRole("button", {
        name: "Close notification",
      }),
    );

    expect(mockDispatch).toHaveBeenCalledWith(setSnackbarError(null));
  });

  it("success と warning は自動で閉じる", () => {
    mockUseAppSelectorV2.mockImplementation((selector) =>
      selector({
        snackbar: {
          success: "保存しました",
          error: null,
          warn: "注意してください",
        },
      }),
    );

    render(<SnackbarGroup />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockDispatch).toHaveBeenCalledWith(setSnackbarSuccess(null));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockDispatch).toHaveBeenCalledWith(setSnackbarWarn(null));
    expect(mockDispatch).not.toHaveBeenCalledWith(setSnackbarError(null));
  });
});
