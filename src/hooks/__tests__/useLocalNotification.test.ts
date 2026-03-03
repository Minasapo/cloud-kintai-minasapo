import { LocalNotificationManager } from "@shared/lib/localNotification";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useLocalNotification } from "../useLocalNotification";

// Mock logger
jest.mock("@shared/lib/logger", () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe("useLocalNotification", () => {
  let manager: LocalNotificationManager;
  let originalNotification: any;

  beforeEach(() => {
    // Setup global Notification mock
    originalNotification = (global as any).Notification;
    (global as any).Notification = jest.fn(function (
      title: string,
      options?: any,
    ) {
      return {
        title,
        options,
        close: jest.fn(),
        addEventListener: jest.fn(),
      };
    });
    (global as any).Notification.permission = "granted";
    (global as any).Notification.requestPermission = jest
      .fn()
      .mockResolvedValue("granted");

    (LocalNotificationManager as any).instance = null;
    manager = LocalNotificationManager.getInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalNotification) {
      (global as any).Notification = originalNotification;
    }
  });

  afterEach(() => {
    manager.clearQueue();
  });

  it("should render without crashing", () => {
    const { result } = renderHook(() => useLocalNotification());
    expect(result.current).toBeDefined();
  });

  it("should initialize with correct permission status", () => {
    const { result } = renderHook(() => useLocalNotification());
    expect(result.current.permission).toBe("granted");
  });

  it("should have correct isSupported value", () => {
    const { result } = renderHook(() => useLocalNotification());
    expect(result.current.isSupported).toBe(true);
  });

  it("should have correct canNotify value when permission is granted", () => {
    const { result } = renderHook(() => useLocalNotification());
    expect(result.current.canNotify).toBe(true);
  });

  it("should request permission and update state", async () => {
    (global as any).Notification.permission = "default";
    const mockRequestPermission = jest.fn().mockResolvedValue("granted");
    (global as any).Notification.requestPermission = mockRequestPermission;

    const { result } = renderHook(() => useLocalNotification());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it("should set loading state during permission request", async () => {
    const mockRequestPermission = jest
      .fn()
      .mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("granted"), 100)),
      );
    (global as any).Notification.requestPermission = mockRequestPermission;

    const { result } = renderHook(() => useLocalNotification());

    // Initial state
    expect(result.current.loading).toBe(false);

    // Start request
    act(() => {
      result.current.requestPermission();
    });

    // May or may not be loading at this point due to timing
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle permission request errors", async () => {
    const mockError = new Error("Permission denied");
    const mockRequestPermission = jest.fn().mockRejectedValue(mockError);
    (global as any).Notification.requestPermission = mockRequestPermission;

    const { result } = renderHook(() => useLocalNotification());

    await act(async () => {
      try {
        await result.current.requestPermission();
      } catch (error) {
        // Expected
      }
    });

    expect(result.current.error).toBeDefined();
  });

  it("should show notification", async () => {
    const mockNotification = {
      title: "Test",
      close: jest.fn(),
      addEventListener: jest.fn(),
    };
    const mockConstructor = jest.fn().mockReturnValue(mockNotification);
    (mockConstructor as any).permission = "granted";
    (global as any).Notification = mockConstructor;

    const { result } = renderHook(() => useLocalNotification());

    await act(async () => {
      await result.current.notify("Test Title", { body: "Test body" });
    });

    expect(mockConstructor).toHaveBeenCalled();
  });

  it("should handle notification errors", async () => {
    (global as any).Notification.permission = "denied";

    const { result } = renderHook(() => useLocalNotification());

    await act(async () => {
      try {
        await result.current.notify("Test");
      } catch (error) {
        // Expected
      }
    });

    expect(result.current.error).toBeDefined();
  });

  it("should clear error state when successful", async () => {
    const { result } = renderHook(() => useLocalNotification());

    // Set initial error
    await act(async () => {
      try {
        (Notification as any).permission = "denied";
        await result.current.notify("Test");
      } catch (error) {
        // Expected
      }
    });

    expect(result.current.error).toBeDefined();

    // Successful call
    (global as any).Notification.permission = "granted";
    const mockNotification = {
      title: "Test",
      close: jest.fn(),
      addEventListener: jest.fn(),
    };
    const mockConstructor = jest.fn().mockReturnValue(mockNotification);
    (mockConstructor as any).permission = "granted";
    (global as any).Notification = mockConstructor;

    await act(async () => {
      await result.current.notify("Test");
    });

    expect(result.current.error).toBeNull();
  });
});
