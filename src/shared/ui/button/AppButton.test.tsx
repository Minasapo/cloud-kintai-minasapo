import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AppButton from "./AppButton";

describe("AppButton", () => {
  it("button要素として描画し、variant/tone/size属性を保持する", () => {
    render(
      <AppButton variant="outline" tone="danger" size="sm">
        削除
      </AppButton>,
    );

    const button = screen.getByRole("button", { name: "削除" });
    expect(button).toHaveAttribute("data-app-button-variant", "outline");
    expect(button).toHaveAttribute("data-app-button-tone", "danger");
    expect(button).toHaveAttribute("data-app-button-size", "sm");
  });

  it("loading時は無効化しスピナーを表示する", () => {
    render(<AppButton loading>保存</AppButton>);

    const button = screen.getByRole("button", { name: "保存" });
    expect(button).toBeDisabled();
    expect(button.querySelector(".app-button__spinner")).toBeInTheDocument();
  });

  it("type=submitをbuttonに渡せる", () => {
    render(<AppButton type="submit">送信</AppButton>);

    expect(screen.getByRole("button", { name: "送信" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("as=labelでlabel要素として描画できる", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <AppButton as="label" onClick={handleClick}>
        CSVを選択
      </AppButton>,
    );

    const label = screen.getByText("CSVを選択").closest("label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("data-app-button-variant", "solid");

    if (label) {
      await user.click(label);
    }

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("fullWidth属性を保持する", () => {
    render(<AppButton fullWidth>適用</AppButton>);

    expect(screen.getByRole("button", { name: "適用" })).toHaveAttribute(
      "data-app-button-full-width",
      "true",
    );
  });
});
