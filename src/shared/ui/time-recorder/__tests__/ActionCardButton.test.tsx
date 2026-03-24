import { render, screen } from "@testing-library/react";

import ActionCardButton from "@/shared/ui/time-recorder/ActionCardButton";
import {
  buildActionCardVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "@/shared/ui/time-recorder/buttonStyles";

const style = buildActionCardVars(TIME_RECORDER_BUTTON_PALETTES.clockIn);

describe("ActionCardButton", () => {
  it("icon未指定時はアイコン領域を描画しない", () => {
    const { container } = render(
      <ActionCardButton
        testId="action-card"
        style={style}
        label="勤務開始"
      />,
    );

    expect(container.querySelector(".action-card-icon")).not.toBeInTheDocument();
  });

  it("shape=circle で円形クラスを適用する", () => {
    render(
      <ActionCardButton
        testId="action-card"
        style={style}
        shape="circle"
        layout="center"
        label="勤務開始"
      />,
    );

    const button = screen.getByTestId("action-card");
    expect(button).toHaveAttribute("data-action-card-shape", "circle");
    expect(button.className).toContain("rounded-full");
  });

  it("size=slim で縮小サイズクラスを適用する", () => {
    render(
      <ActionCardButton
        testId="action-card"
        style={style}
        size="slim"
        layout="center"
        label="休憩開始"
      />,
    );

    const button = screen.getByTestId("action-card");
    expect(button).toHaveAttribute("data-action-card-size", "slim");
    expect(button.className).toContain("min-h-[52px]");
    expect(button.className).toContain("md:min-h-[62px]");
  });
});
