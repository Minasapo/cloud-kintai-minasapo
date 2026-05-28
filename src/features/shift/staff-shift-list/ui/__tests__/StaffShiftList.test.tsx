import { AuthContext } from "@app/providers/auth/AuthContext";
import { ShiftRequestStatus } from "@shared/api/graphql/types";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import StaffShiftList from "../StaffShiftList";

type MockShiftRequest = {
  id: string;
  staffId: string;
  targetMonth: string;
  entries: Array<{
    date: string;
    status: ShiftRequestStatus;
    isLocked?: boolean | null;
  }>;
  histories: Array<{
    version: number;
    entries: Array<{
      date: string;
      status: ShiftRequestStatus;
      isLocked?: boolean | null;
    }>;
    recordedAt: string;
    recordedByStaffId?: string | null;
  }>;
  updatedAt: string;
  updatedBy?: string | null;
  version?: number | null;
};

const requestStore = new Map<string, MockShiftRequest | null>();
const queryHookMock = jest.fn();
const updateShiftCellMock = jest.fn();
const createShiftRequestMock = jest.fn();
const notifyMock = jest.fn();

jest.mock("@entities/staff/model/useStaffs/useStaffs", () => ({
  __esModule: true,
  useStaffs: () => ({
    loading: false,
    error: null,
    staffs: [makeStaff()],
  }),
}));

jest.mock("@entities/calendar/model/useCalendars", () => ({
  __esModule: true,
  useCalendars: () => ({
    holidayCalendars: [],
    companyHolidayCalendars: [],
    isLoading: false,
    error: null,
  }),
}));

jest.mock("@entities/shift/api/shiftApi", () => ({
  __esModule: true,
  nonNullable: (value: unknown) => value !== null && value !== undefined,
  useGetShiftRequestQuery: (...args: unknown[]) => queryHookMock(...args),
  useUpdateShiftCellMutation: () => [updateShiftCellMock, { isLoading: false }],
  useCreateShiftRequestMutation: () => [createShiftRequestMock, { isLoading: false }],
}));

jest.mock("@shared/lib/useAppNotification", () => ({
  __esModule: true,
  useAppNotification: () => ({ notify: notifyMock }),
}));

jest.mock("@shared/ui/breadcrumbs/CommonBreadcrumbs", () => ({
  __esModule: true,
  default: ({ current }: { current: string }) => (
    <nav aria-label="breadcrumb">{current}</nav>
  ),
}));

const authenticatedContext: React.ContextType<typeof AuthContext> = {
  authStatus: "authenticated",
  session: { roles: [] },
  signOut: jest.fn(),
  signIn: jest.fn(),
  isCognitoUserRole: () => false,
  isAuthenticated: true,
  cognitoUser: {
    id: "user-1",
    givenName: "Test",
    familyName: "User",
    mailAddress: "test@example.com",
    owner: false,
    roles: [],
    emailVerified: true,
  },
};

function makeStaff() {
  return {
    id: "staff-1",
    familyName: "山田",
    givenName: "太郎",
    workType: "shift",
    cognitoUserId: "cognito-1",
    mailAddress: "test@example.com",
    owner: false,
    role: "Staff",
    enabled: true,
    status: "CONFIRMED",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  };
}

function buildMonthKey(month: dayjs.Dayjs) {
  return month.startOf("month").format("YYYY-MM");
}

function buildDate(monthKey: string, day: number) {
  return dayjs(`${monthKey}-01`).date(day).format("YYYY-MM-DD");
}

function makeRequest(
  monthKey: string,
  overrides: Partial<MockShiftRequest> = {},
): MockShiftRequest {
  return {
    id: overrides.id ?? `req-${monthKey}`,
    staffId: overrides.staffId ?? "staff-1",
    targetMonth: monthKey,
    entries: overrides.entries ?? [],
    histories: overrides.histories ?? [],
    updatedAt: overrides.updatedAt ?? `${monthKey}-01T00:00:00Z`,
    updatedBy: overrides.updatedBy ?? "user-1",
    version: overrides.version ?? 1,
  };
}

function makeQueryResult(request: MockShiftRequest | null) {
  return {
    data: request,
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: jest.fn(),
  };
}

function serializeKey(staffId: string, targetMonth: string) {
  return `${staffId}:${targetMonth}`;
}

function seedRequests(entries: Array<[string, MockShiftRequest | null]>) {
  requestStore.clear();
  entries.forEach(([key, value]) => {
    requestStore.set(key, value);
  });
}

function installMutationHandlers() {
  updateShiftCellMock.mockImplementation(({ input }: { input: { id: string; staffId: string; targetMonth: string; entries: MockShiftRequest["entries"]; histories: MockShiftRequest["histories"]; updatedAt: string; updatedBy?: string | null; version?: number | null; } }) => {
    const updated = makeRequest(input.targetMonth, {
      id: input.id,
      staffId: input.staffId,
      entries: input.entries,
      histories: input.histories,
      updatedAt: input.updatedAt,
      updatedBy: input.updatedBy ?? null,
      version: input.version ?? null,
    });
    requestStore.set(serializeKey(input.staffId, input.targetMonth), updated);
    return { unwrap: () => Promise.resolve(updated) };
  });

  createShiftRequestMock.mockImplementation(({ input }: { input: { staffId: string; targetMonth: string; entries: MockShiftRequest["entries"]; histories: MockShiftRequest["histories"]; updatedAt: string; updatedBy?: string | null; version?: number | null; } }) => {
    const created = makeRequest(input.targetMonth, {
      id: `req-${input.staffId}-${input.targetMonth}`,
      staffId: input.staffId,
      entries: input.entries,
      histories: input.histories,
      updatedAt: input.updatedAt,
      updatedBy: input.updatedBy ?? null,
      version: input.version ?? null,
    });
    requestStore.set(serializeKey(input.staffId, input.targetMonth), created);
    return { unwrap: () => Promise.resolve(created) };
  });
}

function renderStaffShiftList(staffId = "staff-1") {
  return render(
    <AuthContext.Provider value={authenticatedContext}>
      <MemoryRouter initialEntries={[`/admin/shift/staff/${staffId}`]}>
        <Routes>
          <Route
            path="/admin/shift/staff/:staffId"
            element={<StaffShiftList />}
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

function getRowByDateLabel(label: string) {
  const dateCell = screen.getByText(label);
  const row = dateCell.closest("tr");
  if (!row) {
    throw new Error(`Row for ${label} not found`);
  }
  return row;
}

beforeEach(() => {
  jest.clearAllMocks();
  installMutationHandlers();

  const currentMonthKey = buildMonthKey(dayjs());
  const nextMonthKey = buildMonthKey(dayjs(`${currentMonthKey}-01`).add(1, "month"));

  seedRequests([
    [
      serializeKey("staff-1", currentMonthKey),
      makeRequest(currentMonthKey, {
        entries: [
          {
            date: buildDate(currentMonthKey, 1),
            status: ShiftRequestStatus.WORK,
            isLocked: false,
          },
        ],
        histories: [
          {
            version: 1,
            entries: [
              {
                date: buildDate(currentMonthKey, 1),
                status: ShiftRequestStatus.WORK,
                isLocked: false,
              },
            ],
            recordedAt: `${currentMonthKey}-01T00:00:00Z`,
            recordedByStaffId: "user-1",
          },
        ],
        version: 1,
      }),
    ],
    [
      serializeKey("staff-1", nextMonthKey),
      makeRequest(nextMonthKey, {
        entries: [
          {
            date: buildDate(nextMonthKey, 2),
            status: ShiftRequestStatus.FIXED_OFF,
            isLocked: false,
          },
        ],
        histories: [
          {
            version: 1,
            entries: [
              {
                date: buildDate(nextMonthKey, 2),
                status: ShiftRequestStatus.FIXED_OFF,
                isLocked: false,
              },
            ],
            recordedAt: `${nextMonthKey}-01T00:00:00Z`,
            recordedByStaffId: "user-1",
          },
        ],
        version: 1,
      }),
    ],
  ]);

  queryHookMock.mockImplementation(
    ({ staffId, targetMonth }: { staffId: string; targetMonth: string }, options?: { skip?: boolean }) => {
      if (options?.skip || !staffId || !targetMonth) {
        return makeQueryResult(null);
      }

      return makeQueryResult(
        requestStore.get(serializeKey(staffId, targetMonth)) ?? null,
      );
    },
  );
});

describe("StaffShiftList", () => {
  it("実データを表示し、Math.random は使わない", () => {
    const randomSpy = jest.spyOn(Math, "random");
    renderStaffShiftList();

    expect(screen.getByText("シフト詳細")).toBeInTheDocument();
    expect(screen.getByText("山田 太郎 のシフト")).toBeInTheDocument();
    expect(
      screen.queryByText("この月のシフトは未登録です"),
    ).not.toBeInTheDocument();
    expect(randomSpy).not.toHaveBeenCalled();
  });

  it("既存データを更新し、月をまたいでも保存済み状態を保持する", async () => {
    const user = userEvent.setup();
    const currentMonthKey = buildMonthKey(dayjs());
    const nextMonthKey = buildMonthKey(
      dayjs(`${currentMonthKey}-01`).add(1, "month"),
    );

    renderStaffShiftList();

    const currentRow = getRowByDateLabel(
      dayjs(buildDate(currentMonthKey, 1)).format("M月D日"),
    );
    const workButton = within(currentRow).getByRole("button", { name: "出勤" });
    const offButton = within(currentRow).getByRole("button", { name: "休み" });

    expect(workButton).toHaveAttribute("aria-pressed", "true");

    await user.click(offButton);

    await waitFor(() => {
      expect(offButton).toHaveAttribute("aria-pressed", "true");
    });

    expect(updateShiftCellMock).toHaveBeenCalled();
    expect(
      requestStore.get(serializeKey("staff-1", currentMonthKey))?.entries,
    ).toEqual([
      {
        date: buildDate(currentMonthKey, 1),
        status: ShiftRequestStatus.FIXED_OFF,
        isLocked: false,
      },
    ]);

    await user.click(screen.getByText("翌月"));

    const nextRow = getRowByDateLabel(
      dayjs(buildDate(nextMonthKey, 2)).format("M月D日"),
    );
    expect(
      within(nextRow).getByRole("button", { name: "休み" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByText("前月"));

    const restoredRow = getRowByDateLabel(
      dayjs(buildDate(currentMonthKey, 1)).format("M月D日"),
    );
    expect(
      within(restoredRow).getByRole("button", { name: "休み" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("未登録の月では空状態を表示し、初回更新で新規作成する", async () => {
    const user = userEvent.setup();
    const currentMonthKey = buildMonthKey(dayjs());
    seedRequests([
      [
        serializeKey("staff-1", currentMonthKey),
        null,
      ],
    ]);

    renderStaffShiftList();

    expect(screen.getByText("この月のシフトは未登録です")).toBeInTheDocument();

    const firstRow = getRowByDateLabel(
      dayjs(buildDate(currentMonthKey, 1)).format("M月D日"),
    );
    await user.click(within(firstRow).getByRole("button", { name: "出勤" }));

    await waitFor(() => {
      expect(createShiftRequestMock).toHaveBeenCalled();
    });

    expect(
      requestStore.get(serializeKey("staff-1", currentMonthKey))?.entries,
    ).toEqual([
      {
        date: buildDate(currentMonthKey, 1),
        status: ShiftRequestStatus.WORK,
        isLocked: false,
      },
    ]);
  });
});
