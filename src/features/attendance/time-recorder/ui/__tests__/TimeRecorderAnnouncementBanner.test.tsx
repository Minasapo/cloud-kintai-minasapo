import { fireEvent, render, screen } from "@testing-library/react";

import TimeRecorderAnnouncementBanner from "@/features/attendance/time-recorder/ui/TimeRecorderAnnouncementBanner";

describe("TimeRecorderAnnouncementBanner", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("有効かつ本文ありの場合のみ表示する", () => {
    const { rerender } = render(
      <TimeRecorderAnnouncementBanner
        configId="cfg-1"
        announcement={{ enabled: true, message: "お知らせ" }}
      />,
    );

    expect(
      screen.getByTestId("time-recorder-announcement-banner"),
    ).toBeInTheDocument();

    rerender(
      <TimeRecorderAnnouncementBanner
        configId="cfg-1"
        announcement={{ enabled: false, message: "お知らせ" }}
      />,
    );

    expect(
      screen.queryByTestId("time-recorder-announcement-banner"),
    ).not.toBeInTheDocument();
  });

  it("閉じるとlocalStorageに保存し再マウント後も非表示になる", () => {
    const key = "timeRecorderAnnouncementDismissed:cfg-1:お知らせ";
    const { unmount } = render(
      <TimeRecorderAnnouncementBanner
        configId="cfg-1"
        announcement={{ enabled: true, message: "お知らせ" }}
      />,
    );

    fireEvent.click(
      screen.getByTestId("time-recorder-announcement-close-button"),
    );

    expect(localStorage.getItem(key)).toBe("1");
    expect(
      screen.queryByTestId("time-recorder-announcement-banner"),
    ).not.toBeInTheDocument();

    unmount();

    render(
      <TimeRecorderAnnouncementBanner
        configId="cfg-1"
        announcement={{ enabled: true, message: "お知らせ" }}
      />,
    );

    expect(
      screen.queryByTestId("time-recorder-announcement-banner"),
    ).not.toBeInTheDocument();
  });

  it("message変更時はdismissキーが変わり再表示される", () => {
    localStorage.setItem("timeRecorderAnnouncementDismissed:cfg-1:旧文言", "1");

    render(
      <TimeRecorderAnnouncementBanner
        configId="cfg-1"
        announcement={{ enabled: true, message: "新文言" }}
      />,
    );

    expect(
      screen.getByTestId("time-recorder-announcement-banner"),
    ).toBeInTheDocument();
  });
});
