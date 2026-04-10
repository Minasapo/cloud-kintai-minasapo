import { render, screen } from "@testing-library/react";

import AppSaveButton from "./AppSaveButton";

describe("AppSaveButton", () => {
  it("デフォルトで保存ラベルと保存アイコンを表示する", () => {
    render(<AppSaveButton />);

    const button = screen.getByRole("button", { name: "保存" });
    expect(button).toHaveAttribute("data-app-button-variant", "solid");
    expect(button).toHaveAttribute("data-app-button-tone", "primary");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("loading時は無効化しスピナーを表示する", () => {
    render(<AppSaveButton loading />);

    const button = screen.getByRole("button", { name: "保存" });
    expect(button).toBeDisabled();
    expect(button.querySelector(".app-button__spinner")).toBeInTheDocument();
  });

  it("childrenでラベルを上書きできる", () => {
    render(<AppSaveButton>全体を保存</AppSaveButton>);

    expect(
      screen.getByRole("button", { name: "全体を保存" }),
    ).toBeInTheDocument();
  });

  it("disabled属性をbuttonに反映する", () => {
    render(<AppSaveButton disabled />);

    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
  });
});
