import type { ThemeMode } from "@app/providers/theme/ThemeContext";
import { useThemeContext } from "@app/providers/theme/ThemeContext";
import { renderHook } from "@testing-library/react";

import { useThemeMode } from "../useThemeMode";

jest.mock("@app/providers/theme/ThemeContext", () => ({
  useThemeContext: jest.fn(),
}));

describe("useThemeMode", () => {
  const setMode = jest.fn();
  const mockUseThemeContext = useThemeContext as jest.MockedFunction<
    typeof useThemeContext
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const setup = (mode: ThemeMode = "auto") => {
    mockUseThemeContext.mockReturnValue({ mode, setMode });
    return renderHook(() => useThemeMode());
  };

  it("保存されたテーマモードが有効値で現在値と異なる場合、setMode を呼ぶこと", () => {
    localStorage.setItem("app-theme-mode", "light");

    setup("auto");

    expect(setMode).toHaveBeenCalledWith("light");
  });

  it("保存されたテーマモードが現在値と同じ場合、setMode を呼ばないこと", () => {
    localStorage.setItem("app-theme-mode", "light");

    setup("light");

    expect(setMode).not.toHaveBeenCalled();
  });

  it("保存されたテーマモードが不正値の場合、localStorage から削除して setMode を呼ばないこと", () => {
    localStorage.setItem("app-theme-mode", "dark");
    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");

    setup("auto");

    expect(removeItemSpy).toHaveBeenCalledWith("app-theme-mode");
    expect(setMode).not.toHaveBeenCalled();
    removeItemSpy.mockRestore();
  });
});
