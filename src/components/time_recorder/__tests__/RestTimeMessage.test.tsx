import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";

import useAppConfig from "@entities/app-config/model/useAppConfig";

import { RestTimeMessage } from "../RestTimeMessage";

jest.mock("@entities/app-config/model/useAppConfig", () => ({
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
      getLunchRestStartTime: () =>
        dayjs().hour(11).minute(30).second(0).millisecond(0),
      getLunchRestEndTime: () =>
        dayjs().hour(12).minute(45).second(0).millisecond(0),
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
      getLunchRestStartTime: () =>
        dayjs().hour(12).minute(0).second(0).millisecond(0),
      getLunchRestEndTime: () =>
        dayjs().hour(13).minute(0).second(0).millisecond(0),
    } as unknown as ReturnType<typeof useAppConfig>);

    render(<RestTimeMessage />);

    expect(screen.getByTestId("rest-time-message-autostamp")).toHaveTextContent(
      "退勤打刻時に12:00〜13:00の昼休憩が自動追加されます。"
    );
  });
});
