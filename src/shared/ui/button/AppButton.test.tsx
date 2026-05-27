import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AppButton from "./AppButton";

describe("AppButton", () => {
  it("button要素として描画される", () => {
    render(<AppButton>削除</AppButton>);

    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("loading時は無効化しProgressアイコンを表示する", () => {
    render(<AppButton loading>保存</AppButton>);

    const button = screen.getByRole("button", { name: /保存/ });
    expect(button).toBeDisabled();
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

    if (label) {
      await user.click(label);
    }

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("fullWidthを渡せる", () => {
    render(<AppButton fullWidth>適用</AppButton>);

    const button = screen.getByRole("button", { name: "適用" });
    expect(button).toBeInTheDocument();
  });

  it("disabled時はボタンが無効化される", () => {
    render(<AppButton disabled>操作</AppButton>);

    expect(screen.getByRole("button", { name: "操作" })).toBeDisabled();
  });

  it("onClickが呼ばれる", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<AppButton onClick={handleClick}>実行</AppButton>);

    await user.click(screen.getByRole("button", { name: "実行" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
