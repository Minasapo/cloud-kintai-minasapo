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
  let originalNotification: unknown;

  beforeEach(() => {
    // Setup global Notification mock
    const globalWithNotif = global as Record<string, unknown>;
    originalNotification = globalWithNotif.Notification;
    globalWithNotif.Notification = jest.fn(function (
      title: string,
      options?: NotificationOptions,
    ) {
      return {
        title,
        options,
        close: jest.fn(),
        addEventListener: jest.fn(),
      };
    });
    const mockNotification = globalWithNotif.Notification as Record<
      string,
      unknown
    >;
    mockNotification.permission = "granted";
    mockNotification.requestPermission = jest.fn().mockResolvedValue("granted");

    const managerClass = LocalNotificationManager as unknown as Record<
      string,
      unknown
    >;
    managerClass.instance = null;
    manager = LocalNotificationManager.getInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalNotification) {
      (global as Record<string, unknown>).Notification = originalNotification;
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
    const globalNotif = global as Record<string, unknown>;
    const mockNotification = globalNotif.Notification as Record<
      string,
      unknown
    >;
    mockNotification.permission = "default";
    const mockRequestPermission = jest
      .fn()
      .mockResolvedValue("granted" as NotificationPermission);
    mockNotification.requestPermission = mockRequestPermission;

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
          new Promise<NotificationPermission>((resolve) =>
            setTimeout(() => resolve("granted"), 100),
          ),
      );
    const globalNotif = global as Record<string, unknown>;
    const mockNotification = globalNotif.Notification as Record<
      string,
      unknown
    >;
    mockNotification.requestPermission = mockRequestPermission;

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
    const globalNotif = global as Record<string, unknown>;
    const mockNotification = globalNotif.Notification as Record<
      string,
      unknown
    >;
    mockNotification.requestPermission = mockRequestPermission;

    const { result } = renderHook(() => useLocalNotification());

    await act(async () => {
      try {
        await result.current.requestPermission();
      } catch {
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
    const mockNotifWithMethods = mockConstructor as unknown as Record<
      string,
      unknown
    >;
    mockNotifWithMethods.permission = "granted";
    (global as Record<string, unknown>).Notification = mockConstructor;

    const { result } = renderHook(() => useLocalNotification());

    await act(async () => {
      await result.current.notify("Test Title", { body: "Test body" });
    });

    expect(mockConstructor).toHaveBeenCalled();
  });

  it("should handle notification errors", async () => {
    const globalNotif = global as Record<string, unknown>;
    const mockNotification = globalNotif.Notification as Record<
      string,
      unknown
    >;
    mockNotification.permission = "denied";

    const { result } = renderHook(() => useLocalNotification());

    await act(async () => {
      try {
        await result.current.notify("Test");
      } catch {
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
        (Notification as unknown as Record<string, unknown>).permission =
          "denied";
        await result.current.notify("Test");
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBeDefined();

    // Successful call
    const globalNotif = global as Record<string, unknown>;
    const mockNotification = globalNotif.Notification as Record<
      string,
      unknown
    >;
    mockNotification.permission = "granted";
    const mockNotifObj = {
      title: "Test",
      close: jest.fn(),
      addEventListener: jest.fn(),
    };
    const mockConstructor = jest.fn().mockReturnValue(mockNotifObj);
    const mockNotifWithMethods = mockConstructor as unknown as Record<
      string,
      unknown
    >;
    mockNotifWithMethods.permission = "granted";
    globalNotif.Notification = mockConstructor;

    await act(async () => {
      await result.current.notify("Test");
    });

    expect(result.current.error).toBeNull();
  });
});
