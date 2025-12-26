import { act, renderHook } from "@testing-library/react";

import { useMobileDrawer } from "../useMobileDrawer";

describe("useMobileDrawer", () => {
  it("初期状態は閉じている", () => {
    const { result } = renderHook(() => useMobileDrawer());

    expect(result.current.isOpen).toBe(false);
  });

  it("openDrawerで開き、closeDrawerで閉じる", () => {
    const { result } = renderHook(() => useMobileDrawer());

    act(() => {
      result.current.openDrawer();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeDrawer();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("toggleDrawerで開閉できる", () => {
    const { result } = renderHook(() => useMobileDrawer());

    act(() => {
      result.current.toggleDrawer(true)();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggleDrawer(false)();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("Tab/Shiftのkeydownでは状態を変えない", () => {
    const { result } = renderHook(() => useMobileDrawer());

    act(() => {
      result.current.toggleDrawer(true)({
        type: "keydown",
        key: "Tab",
      } as React.KeyboardEvent);
    });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggleDrawer(true)({
        type: "keydown",
        key: "Shift",
      } as React.KeyboardEvent);
    });
    expect(result.current.isOpen).toBe(false);
  });
});
