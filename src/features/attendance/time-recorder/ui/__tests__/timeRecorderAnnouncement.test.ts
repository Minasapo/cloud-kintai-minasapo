import {
  buildTimeRecorderAnnouncementDismissKey,
  dismissTimeRecorderAnnouncement,
  isDismissedTimeRecorderAnnouncement,
  shouldShowTimeRecorderAnnouncement,
} from "@/features/attendance/time-recorder/lib/timeRecorderAnnouncement";

describe("timeRecorderAnnouncement", () => {
  it("dismissキーにconfigIdとmessageを含める", () => {
    expect(
      buildTimeRecorderAnnouncementDismissKey(
        "config-1",
        " メンテナンスのお知らせ ",
      ),
    ).toBe(
      "timeRecorderAnnouncementDismissed:config-1:メンテナンスのお知らせ",
    );
  });

  it("dismiss状態を保存・判定できる", () => {
    const storage = {
      getItem: jest.fn(() => "1"),
      setItem: jest.fn(),
    };
    const key = "timeRecorderAnnouncementDismissed:config-1:abc";

    dismissTimeRecorderAnnouncement(storage, key);

    expect(storage.setItem).toHaveBeenCalledWith(key, "1");
    expect(isDismissedTimeRecorderAnnouncement(storage, key)).toBe(true);
  });

  it("表示条件を判定する", () => {
    expect(
      shouldShowTimeRecorderAnnouncement(
        { enabled: true, message: "お知らせ" },
        false,
      ),
    ).toBe(true);
    expect(
      shouldShowTimeRecorderAnnouncement(
        { enabled: false, message: "お知らせ" },
        false,
      ),
    ).toBe(false);
    expect(
      shouldShowTimeRecorderAnnouncement(
        { enabled: true, message: "   " },
        false,
      ),
    ).toBe(false);
    expect(
      shouldShowTimeRecorderAnnouncement(
        { enabled: true, message: "お知らせ" },
        true,
      ),
    ).toBe(false);
  });
});
