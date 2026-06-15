import { useAppDispatchV2 } from "@app/hooks";
import { CloseDate, UpdateCloseDateInput } from "@shared/api/graphql/types";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import dayjs from "dayjs";

import * as MESSAGE_CODE from "@/errors";

import EditJobTermInputDialog from "../EditJobTermInputDialog";

const mockDispatch = jest.fn();
const mockRequestClose = jest.fn();
const mockCloseWithoutGuard = jest.fn();

jest.mock("@app/hooks", () => ({
  useAppDispatchV2: jest.fn(),
}));

jest.mock("@shared/lib/store/notificationSlice", () => ({
  pushNotification: jest.fn((payload) => ({
    type: "notification/push",
    payload,
  })),
}));

jest.mock("@shared/ui/feedback/useDialogCloseGuard", () => ({
  useDialogCloseGuard: () => ({
    dialog: null,
    requestClose: (...args: unknown[]) => mockRequestClose(...args),
    closeWithoutGuard: (...args: unknown[]) => mockCloseWithoutGuard(...args),
  }),
}));

jest.mock("@entities/attendance/lib/AttendanceDate", () => ({
  AttendanceDate: {
    DisplayFormat: "YYYY/MM/DD",
  },
}));

jest.mock("@mui/x-date-pickers", () => {
  type DatePickerMockProps = {
    label?: string;
    value: dayjs.Dayjs | null;
    onChange: (v: dayjs.Dayjs | null) => void;
    format?: string;
  };

  const parseInputValue = (value: string, format: string): dayjs.Dayjs | null => {
    if (!value) return null;

    if (format === "YYYY/MM") {
      const monthMatch = value.match(/^(\d{4})\/(\d{1,2})$/);
      if (!monthMatch) return null;
      const [, year, month] = monthMatch;
      const parsed = dayjs(`${year}-${month}-01`);
      return parsed.isValid() ? parsed.startOf("month") : null;
    }

    const dayMatch = value.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!dayMatch) return null;
    const [, year, month, day] = dayMatch;
    const parsed = dayjs(`${year}-${month}-${day}`);
    return parsed.isValid() ? parsed : null;
  };

  const DatePicker = ({
    label,
    value,
    onChange,
    format = "YYYY/MM/DD",
  }: DatePickerMockProps) => (
    <input
      aria-label={label ?? "date-picker"}
      type="text"
      value={value ? value.format(format === "YYYY/MM" ? "YYYY/MM" : "YYYY/MM/DD") : ""}
      onChange={(e) => {
        const parsed = parseInputValue(e.target.value, format);
        onChange(parsed);
      }}
    />
  );

  return { DatePicker };
});

const targetData: CloseDate = {
  __typename: "CloseDate",
  id: "close-date-id",
  closeDate: "2026-06-01T00:00:00.000Z",
  startDate: "2026-05-01T00:00:00.000Z",
  endDate: "2026-05-31T00:00:00.000Z",
  createdAt: "",
  updatedAt: "",
};

const candidateCloseDates = [dayjs("2026-06-01")];

function renderComponent(
  updateCloseDate: (input: UpdateCloseDateInput) => Promise<void>,
) {
  return render(
    <EditJobTermInputDialog
      targetData={targetData}
      open
      onClose={jest.fn()}
      candidateCloseDates={candidateCloseDates}
      updateCloseDate={updateCloseDate}
    />,
  );
}

describe("EditJobTermInputDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatchV2 as jest.Mock).mockReturnValue(mockDispatch);
  });

  it("targetData の値がフォームに初期表示される", async () => {
    const updateCloseDate = jest.fn().mockResolvedValue(undefined);
    renderComponent(updateCloseDate);

    await waitFor(() => {
      expect(screen.getByLabelText("開始日")).toHaveValue("2026/05/01");
      expect(screen.getByLabelText("終了日")).toHaveValue("2026/05/31");
    });

    const closeDateSelect = screen.getByRole("combobox") as HTMLSelectElement;
    expect(closeDateSelect.value).toBe("2026-06");
  });

  it("更新成功時に updateCloseDate が呼ばれ、成功通知と closeWithoutGuard が実行される", async () => {
    const updateCloseDate = jest.fn().mockResolvedValue(undefined);
    renderComponent(updateCloseDate);

    fireEvent.change(screen.getByLabelText("終了日"), {
      target: { value: "2026/06/02" },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "変更" })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "変更" }));

    await waitFor(() => {
      expect(updateCloseDate).toHaveBeenCalledWith({
        id: "close-date-id",
        closeDate: targetData.closeDate,
        startDate: targetData.startDate,
        endDate: dayjs("2026-06-02").toISOString(),
      });
    });

    expect(pushNotification).toHaveBeenCalledWith({
      tone: "success",
      message: MESSAGE_CODE.S09003,
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockCloseWithoutGuard).toHaveBeenCalledTimes(1);
  });

  it("更新失敗時にエラー通知が dispatch される", async () => {
    const updateCloseDate = jest.fn().mockRejectedValue(new Error("failed"));
    renderComponent(updateCloseDate);

    fireEvent.change(screen.getByLabelText("開始日"), {
      target: { value: "2026/05/02" },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "変更" })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "変更" }));

    await waitFor(() => {
      expect(updateCloseDate).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(pushNotification).toHaveBeenCalledWith({
        tone: "error",
        message: MESSAGE_CODE.E09003,
      });
    });

    expect(mockCloseWithoutGuard).not.toHaveBeenCalled();
  });
});
