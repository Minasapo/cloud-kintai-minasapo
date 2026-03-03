/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocalNotificationManager } from "@shared/lib/localNotification/LocalNotificationManager";
import {
  AttendanceNotificationType,
  NotificationNotSupportedError,
  NotificationPermissionError,
} from "@shared/lib/localNotification/types";

// Mock logger
jest.mock("@shared/lib/logger", () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe("LocalNotificationManager", () => {
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
    (global as any).Notification.permission = "default";
    (global as any).Notification.requestPermission = jest
      .fn()
      .mockResolvedValue("granted");

    // Clear singleton
    (LocalNotificationManager as any).instance = null;
    manager = LocalNotificationManager.getInstance();

    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalNotification) {
      (global as any).Notification = originalNotification;
    }
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const manager1 = LocalNotificationManager.getInstance();
      const manager2 = LocalNotificationManager.getInstance();
      expect(manager1).toBe(manager2);
    });
  });

  describe("isSupported", () => {
    it("should return true when Notification API is available", () => {
      expect(manager.isSupported()).toBe(true);
    });

    it("should return false when Notification API is not available", () => {
      const tempNotification = (global as any).Notification;
      delete (global as any).Notification;

      const newManager = new LocalNotificationManager();
      expect(newManager.isSupported()).toBe(false);

      (global as any).Notification = tempNotification;
    });
  });

  describe("getPermissionStatus", () => {
    it("should return current permission status", () => {
      (global as any).Notification.permission = "granted";
      const status = manager.getPermissionStatus();
      expect(status).toBe("granted");
    });

    it("should return denied when Notification API is not supported", () => {
      const tempNotification = (global as any).Notification;
      delete (global as any).Notification;

      const newManager = new LocalNotificationManager();
      expect(newManager.getPermissionStatus()).toBe("denied");

      (global as any).Notification = tempNotification;
    });
  });

  describe("requestPermission", () => {
    it("should throw NotificationNotSupportedError when API is not available", async () => {
      const tempNotification = (global as any).Notification;
      delete (global as any).Notification;

      const newManager = new LocalNotificationManager();

      await expect(newManager.requestPermission()).rejects.toThrow(
        NotificationNotSupportedError,
      );

      (global as any).Notification = tempNotification;
    });

    it("should request permission and return status", async () => {
      (global as any).Notification.requestPermission = jest
        .fn()
        .mockResolvedValue("granted");

      const result = await manager.requestPermission();

      expect((global as any).Notification.requestPermission).toHaveBeenCalled();
      expect(result).toBe("granted");
    });
  });

  describe("canShowNotifications", () => {
    it("should return true when notification is supported and permission is granted", () => {
      (global as any).Notification.permission = "granted";
      expect(manager.canShowNotifications()).toBe(true);
    });

    it("should return false when permission is denied", () => {
      (global as any).Notification.permission = "denied";
      expect(manager.canShowNotifications()).toBe(false);
    });

    it("should return false when permission is default", () => {
      (global as any).Notification.permission = "default";
      expect(manager.canShowNotifications()).toBe(false);
    });
  });

  describe("showNotification", () => {
    it("should return null when Notification API is not supported", async () => {
      const tempNotification = (global as any).Notification;
      delete (global as any).Notification;

      const newManager = new LocalNotificationManager();
      const result = await newManager.showNotification("Test");

      expect(result).toBeNull();

      (global as any).Notification = tempNotification;
    });

    it("should throw NotificationPermissionError when permission is not granted", async () => {
      (global as any).Notification.permission = "denied";
      await expect(manager.showNotification("Test")).rejects.toThrow(
        NotificationPermissionError,
      );
    });

    it("should create and return a notification", async () => {
      (global as any).Notification.permission = "granted";
      const mockNotification = {
        title: "Test",
        options: { body: "Test body" },
        close: jest.fn(),
        addEventListener: jest.fn(),
      };
      const mockConstructor = jest.fn().mockReturnValue(mockNotification);
      (mockConstructor as any).permission = "granted";
      (global as any).Notification = mockConstructor;

      const result = await manager.showNotification("Test", {
        body: "Test body",
      });

      expect(result).toBeDefined();
      expect(mockConstructor).toHaveBeenCalled();
    });

    it("should call onShow callback when notification is created", async () => {
      (global as any).Notification.permission = "granted";
      const mockNotification = {
        title: "Test",
        options: {},
        close: jest.fn(),
        addEventListener: jest.fn(),
      };
      const mockConstructor = jest.fn().mockReturnValue(mockNotification);
      (mockConstructor as any).permission = "granted";
      (global as any).Notification = mockConstructor;

      const onShow = jest.fn();
      await manager.showNotification("Test", { onShow });

      expect(onShow).toHaveBeenCalledWith(mockNotification);
    });
  });

  describe("showAttendanceNotification", () => {
    it("should show clock in success notification", async () => {
      (global as any).Notification.permission = "granted";
      const mockNotification = {
        close: jest.fn(),
        addEventListener: jest.fn(),
      };
      const mockConstructor = jest.fn().mockReturnValue(mockNotification);
      (mockConstructor as any).permission = "granted";
      (global as any).Notification = mockConstructor;

      jest.spyOn(manager, "showNotification");

      await manager.showAttendanceNotification(
        AttendanceNotificationType.CLOCK_IN_SUCCESS,
        {
          time: "10:30",
        },
      );

      expect(manager.showNotification).toHaveBeenCalledWith(
        "出勤打刻完了",
        expect.any(Object),
      );
    });

    it("should show error notification with requireInteraction", async () => {
      (global as any).Notification.permission = "granted";
      const mockNotification = {
        close: jest.fn(),
        addEventListener: jest.fn(),
      };
      const mockConstructor = jest.fn().mockReturnValue(mockNotification);
      (mockConstructor as any).permission = "granted";
      (global as any).Notification = mockConstructor;

      jest.spyOn(manager, "showNotification");

      await manager.showAttendanceNotification(
        AttendanceNotificationType.CLOCK_IN_ERROR,
        {
          error: "ネットワークエラー",
        },
      );

      expect(manager.showNotification).toHaveBeenCalledWith(
        "打刻失敗",
        expect.objectContaining({
          mode: "await-interaction",
          priority: "high",
        }),
      );
    });
  });

  describe("Queue Management", () => {
    it("should add notifications to queue", async () => {
      (global as any).Notification.permission = "granted";
      const mockNotification = {
        close: jest.fn(),
        addEventListener: jest.fn(),
      };
      const mockConstructor = jest.fn().mockReturnValue(mockNotification);
      (mockConstructor as any).permission = "granted";
      (global as any).Notification = mockConstructor;

      await manager.showNotification("Test", { tag: "test-tag" });
      expect(manager.getQueueSize()).toBe(1);
    });

    it("should return queue size", async () => {
      expect(manager.getQueueSize()).toBe(0);
    });

    it("should close notification by tag", async () => {
      (global as any).Notification.permission = "granted";
      const mockNotification = {
        close: jest.fn(),
        addEventListener: jest.fn(),
      };
      const mockConstructor = jest.fn().mockReturnValue(mockNotification);
      (mockConstructor as any).permission = "granted";
      (global as any).Notification = mockConstructor;

      await manager.showNotification("Test", { tag: "test-tag" });
      manager.closeNotificationByTag("test-tag");

      expect(mockNotification.close).toHaveBeenCalled();
    });

    it("should clear queue", async () => {
      (global as any).Notification.permission = "granted";
      const mockNotification = {
        close: jest.fn(),
        addEventListener: jest.fn(),
      };
      const mockConstructor = jest.fn().mockReturnValue(mockNotification);
      (mockConstructor as any).permission = "granted";
      (global as any).Notification = mockConstructor;

      await manager.showNotification("Test", { tag: "test-tag" });
      manager.clearQueue();

      expect(manager.getQueueSize()).toBe(0);
    });
  });
});
