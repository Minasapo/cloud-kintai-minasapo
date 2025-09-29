import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";

import { RestTimeMessage } from "../RestTimeMessage";

jest.mock("@/hooks/useAppConfig/useAppConfig", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("RestTimeMessage", () => {
  const mockUseAppConfig = useAppConfig as jest.MockedFunction<
    typeof useAppConfig
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("AppConfig で設定された昼休憩時間を表示する", () => {
    mockUseAppConfig.mockReturnValue({
      getLunchRestStartTime: () => dayjs("11:30", "HH:mm"),
      getLunchRestEndTime: () => dayjs("12:45", "HH:mm"),
    } as unknown as ReturnType<typeof useAppConfig>);

    render(<RestTimeMessage />);

    expect(screen.getByTestId("rest-time-message-autostamp")).toHaveTextContent(
      "退勤打刻時に11:30〜12:45の昼休憩が自動追加されます。"
    );
    expect(screen.getByTestId("rest-time-message-support")).toHaveTextContent(
      "修正する際は、変更リクエストまたは管理者へ問い合わせてください。"
    );
  });

  it("昼休憩がデフォルト設定の場合でも文言を表示する", () => {
    mockUseAppConfig.mockReturnValue({
      getLunchRestStartTime: () => dayjs("12:00", "HH:mm"),
      getLunchRestEndTime: () => dayjs("13:00", "HH:mm"),
    } as unknown as ReturnType<typeof useAppConfig>);

    render(<RestTimeMessage />);

    expect(screen.getByTestId("rest-time-message-autostamp")).toHaveTextContent(
      "退勤打刻時に12:00〜13:00の昼休憩が自動追加されます。"
    );
  });
});
