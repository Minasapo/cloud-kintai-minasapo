import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import TimeElapsedErrorDialog from "../TimeElapsedErrorDialog";

function LocationProbe() {
  const location = useLocation();

  return <div data-testid="location-path">{location.pathname}</div>;
}

describe("TimeElapsedErrorDialog", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("modal root に描画され、あとでボタンで閉じられる", () => {
    render(
      <MemoryRouter>
        <LocationProbe />
        <TimeElapsedErrorDialog isTimeElapsedError />
      </MemoryRouter>,
    );

    const overlayRoot = document.getElementById("app-overlay-root");
    expect(overlayRoot).toContainElement(
      screen.getByTestId("time-elapsed-error-dialog"),
    );

    fireEvent.click(screen.getByTestId("time-elapsed-error-dialog-later-btn"));

    expect(
      screen.queryByTestId("time-elapsed-error-dialog"),
    ).not.toBeInTheDocument();
  });

  it("確認するボタンで勤怠一覧へ遷移して閉じる", async () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <LocationProbe />
        <TimeElapsedErrorDialog isTimeElapsedError />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("time-elapsed-error-dialog-confirm-btn"));

    await waitFor(() => {
      expect(screen.queryByTestId("time-elapsed-error-dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("location-path")).toHaveTextContent("/attendance/list");
  });
});
