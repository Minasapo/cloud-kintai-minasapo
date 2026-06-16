import {
  AttendanceEditUiContext,
  defaultAttendanceEditContextValue,
} from "@features/attendance/edit/model/AttendanceEditProvider";
import { AttendanceEditInputs } from "@features/attendance/edit/model/common";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { useForm, useWatch } from "react-hook-form";

import TimeInputBase from "./TimeInputBase";

function ValueProbe({
  control,
}: {
  control: ReturnType<typeof useForm<AttendanceEditInputs>>["control"];
}) {
  const value = useWatch({ control, name: "startTime" });

  return <output data-testid="start-time-value">{value ?? ""}</output>;
}

function Wrapper({
  startTime = "2024-04-01T09:00:00",
  quickInputTimes = [{ time: "09:00", enabled: true }],
}: {
  startTime?: string | null;
  quickInputTimes?: { time: string; enabled: boolean }[];
}) {
  const form = useForm<AttendanceEditInputs>({
    defaultValues: {
      startTime,
    },
  });

  return (
    <AttendanceEditUiContext.Provider
      value={{
        ...defaultAttendanceEditContextValue,
        readOnly: false,
      }}
    >
      <div>
        <TimeInputBase<"startTime">
          name="startTime"
          control={form.control}
          setValue={form.setValue}
          workDate={dayjs("2024-04-01")}
          quickInputTimes={quickInputTimes}
          dataTestId="work-start-time-input"
        />
        <ValueProbe control={form.control} />
        <button type="button">outside</button>
      </div>
    </AttendanceEditUiContext.Provider>
  );
}

describe("TimeInputBase", () => {
  it("keeps manually typed times even when they are not in the suggestion list", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Wrapper quickInputTimes={[{ time: "09:00", enabled: true }]} />);

    const input = screen.getByTestId("work-start-time-input");
    await user.click(input);
    await user.clear(input);
    await user.type(input, "1430");
    await user.click(screen.getByRole("button", { name: "outside" }));

    await waitFor(() => {
      expect(screen.getByTestId("start-time-value").textContent).not.toBe("");
    });
    expect(
      dayjs(screen.getByTestId("start-time-value").textContent).format("HH:mm"),
    ).toBe("14:30");
  });

  it("stores null when the input is cleared", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Wrapper startTime="2024-04-01T09:00:00" />);

    const input = screen.getByTestId("work-start-time-input");
    await user.click(input);
    await user.clear(input);
    await user.click(screen.getByRole("button", { name: "outside" }));

    await waitFor(() => {
      expect(screen.getByTestId("start-time-value")).toHaveTextContent("");
    });
  });
});
