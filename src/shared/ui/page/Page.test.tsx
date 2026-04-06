import { render, screen } from "@testing-library/react";

import Page from "./Page";

const getRoot = (container: HTMLElement) => container.firstElementChild as HTMLDivElement;

describe("Page", () => {
  it("defaults to the content width preset", () => {
    const { container } = render(
      <Page title="テスト" showDefaultHeader={false}>
        <div>body</div>
      </Page>,
    );

    const root = getRoot(container);

    expect(root.style.maxWidth).toBe("var(--ds-component-page-widths-content, 1180px)");
    expect(root.style.marginInline).toBe("auto");
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("uses the explicit width preset when provided", () => {
    const { container } = render(
      <Page title="テスト" width="narrow" showDefaultHeader={false}>
        <div>body</div>
      </Page>,
    );

    expect(getRoot(container).style.maxWidth).toBe(
      "var(--ds-component-page-widths-narrow, 768px)",
    );
  });

  it("maps legacy maxWidth aliases to the new presets", () => {
    const { container } = render(
      <Page title="テスト" maxWidth="lg" showDefaultHeader={false}>
        <div>body</div>
      </Page>,
    );

    expect(getRoot(container).style.maxWidth).toBe(
      "var(--ds-component-page-widths-form, 1024px)",
    );
  });

  it("keeps the legacy sm alias for backward compatibility", () => {
    const { container } = render(
      <Page title="テスト" maxWidth="sm" showDefaultHeader={false}>
        <div>body</div>
      </Page>,
    );

    expect(getRoot(container).style.maxWidth).toBe(
      "var(--ds-component-page-widths-legacy-sm, 640px)",
    );
  });

  it("supports full width pages", () => {
    const { container } = render(
      <Page title="テスト" maxWidth={false} showDefaultHeader={false}>
        <div>body</div>
      </Page>,
    );

    const root = getRoot(container);
    expect(root.style.maxWidth).toBe("");
    expect(root.style.marginInline).toBe("");
  });
});
