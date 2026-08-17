import { AuthContext } from "@app/providers/auth/AuthContext";
import {
  StaffRole,
  useStaffs,
} from "@entities/staff/model/useStaffs/useStaffs";
import { render, screen } from "@testing-library/react";

import ShiftRequestPage, { resolveShiftRequestMode } from "./index";

jest.mock("@entities/app-config/model/useAppConfig", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@entities/staff/model/useStaffs/useStaffs", () => {
  const actual = jest.requireActual(
    "@entities/staff/model/useStaffs/useStaffs",
  );
  return {
    ...actual,
    useStaffs: jest.fn(),
  };
});

jest.mock("@features/shift/request-form", () => ({
  ShiftRequestForm: () => <div>shift-request-form</div>,
}));

jest.mock("@extensions/shift-collaborative/pages/ShiftCollaborative", () => ({
  __esModule: true,
  default: () => <div>shift-collaborative-page</div>,
}));

const useAppConfig = jest.requireMock(
  "@entities/app-config/model/useAppConfig",
).default as jest.Mock;
const mockedUseStaffs = jest.mocked(useStaffs);

function renderPage(workType: "shift" | "weekday") {
  mockedUseStaffs.mockReturnValue({
    staffs: [
      {
        id: "staff-1",
        cognitoUserId: "cognito-1",
        familyName: "田中",
        givenName: "太郎",
        mailAddress: "tanaka@example.com",
        owner: false,
        role: StaffRole.STAFF,
        enabled: true,
        status: "CONFIRMED",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        workType,
      },
    ],
    loading: false,
    error: null,
    refreshStaff: jest.fn(),
    createStaff: jest.fn(),
    updateStaff: jest.fn(),
    deleteStaff: jest.fn(),
  } as never);

  return render(
    <AuthContext.Provider
      value={{
        signOut: jest.fn(),
        signIn: jest.fn(),
        isCognitoUserRole: () => false,
        authStatus: "authenticated",
        cognitoUser: {
          id: "cognito-1",
          givenName: "太郎",
          familyName: "田中",
          mailAddress: "tanaka@example.com",
          owner: false,
          roles: [StaffRole.STAFF],
          emailVerified: true,
        },
      }}
    >
      <ShiftRequestPage />
    </AuthContext.Provider>,
  );
}

describe("resolveShiftRequestMode", () => {
  it("AppConfig の表示モードが normal の場合、normal を返すこと", () => {
    expect(resolveShiftRequestMode("normal", true)).toBe("normal");
  });

  it("AppConfig が collaborative かつ共同編集有効の場合、collaborative を返すこと", () => {
    expect(resolveShiftRequestMode("collaborative", true)).toBe(
      "collaborative",
    );
  });

  it("AppConfig が collaborative でも共同編集無効の場合、normal を返すこと", () => {
    expect(resolveShiftRequestMode("collaborative", false)).toBe("normal");
  });
});

describe("ShiftRequestPage", () => {
  beforeEach(() => {
    useAppConfig.mockReset();
    mockedUseStaffs.mockReset();
    useAppConfig.mockReturnValue({
      config: {},
      isConfigLoading: false,
      getShiftCollaborativeEnabled: () => false,
      getShiftDefaultMode: () => "normal",
    });
  });

  it("平日勤務スタッフにはアクセス拒否メッセージを表示すること", () => {
    renderPage("weekday");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "シフト機能は勤務形態がシフト勤務のスタッフのみ利用できます。",
    );
    expect(screen.queryByText("shift-request-form")).not.toBeInTheDocument();
  });

  it("シフト勤務スタッフには申請フォームを表示すること", () => {
    renderPage("shift");

    expect(screen.getByText("shift-request-form")).toBeInTheDocument();
  });
});
