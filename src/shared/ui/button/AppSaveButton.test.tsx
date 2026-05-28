import { render, screen } from "@testing-library/react";

import AppSaveButton from "./AppSaveButton";

describe("AppSaveButton", () => {
  it("デフォルトで保存ラベルと保存アイコンを表示する", () => {
    render(<AppSaveButton />);

    const button = screen.getByRole("button", { name: /保存/ });
    expect(button).toBeInTheDocument();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("loading時は無効化される", () => {
    render(<AppSaveButton loading />);

    const button = screen.getByRole("button", { name: /保存/ });
    expect(button).toBeDisabled();
  });

  it("childrenでラベルを上書きできる", () => {
    render(<AppSaveButton>全体を保存</AppSaveButton>);

    expect(
      screen.getByRole("button", { name: /全体を保存/ }),
    ).toBeInTheDocument();
  });

  it("disabled属性をbuttonに反映する", () => {
    render(<AppSaveButton disabled />);

    expect(screen.getByRole("button", { name: /保存/ })).toBeDisabled();
  });
});
