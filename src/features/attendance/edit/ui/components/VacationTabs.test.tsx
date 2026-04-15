import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import { VacationTabs } from "./VacationTabs";

const items = [
  {
    label: "タブ1",
    content: <div>パネル1</div>,
  },
  {
    label: "タブ2",
    content: <div>パネル2</div>,
  },
  {
    label: "タブ3",
    content: <div>パネル3</div>,
    disabled: true,
  },
];

function TestHarness({
  appearance = "pill",
}: {
  appearance?: "pill" | "mui-standard";
}) {
  const [value, setValue] = useState(0);

  return (
    <VacationTabs
      value={value}
      onChange={setValue}
      items={items}
      appearance={appearance}
      tabsProps={{ "aria-label": "test-tabs" }}
    />
  );
}

describe("VacationTabs", () => {
  it("デフォルトでは既存のピル型スタイルを維持する", () => {
    render(<TestHarness />);

    const activeTab = screen.getByRole("tab", { name: "タブ1" });

    expect(activeTab).toHaveAttribute("aria-selected", "true");
    expect(activeTab).toHaveClass("rounded-full");
    expect(activeTab).toHaveClass("bg-emerald-500");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("パネル1");
  });

  it("mui-standard 指定時は下線付きタブとして切り替えられる", () => {
    render(<TestHarness appearance="mui-standard" />);

    const firstTab = screen.getByRole("tab", { name: "タブ1" });
    const secondTab = screen.getByRole("tab", { name: "タブ2" });

    expect(firstTab).toHaveClass("after:bg-emerald-600");
    expect(firstTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("パネル1");

    fireEvent.click(secondTab);

    expect(secondTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("パネル2");
  });

  it("矢印キーで次の有効タブへ移動する", () => {
    render(<TestHarness appearance="mui-standard" />);

    const firstTab = screen.getByRole("tab", { name: "タブ1" });
    const secondTab = screen.getByRole("tab", { name: "タブ2" });

    fireEvent.keyDown(firstTab, { key: "ArrowRight" });

    expect(secondTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("パネル2");
  });
});
