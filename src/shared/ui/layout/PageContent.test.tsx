import { render } from "@testing-library/react";

import PageContent from "./PageContent";

describe("PageContent", () => {
  it("uses the content preset and page padding by default", () => {
    const { container } = render(
      <PageContent>
        <div>body</div>
      </PageContent>,
    );

    const root = container.firstElementChild as HTMLDivElement;

    expect(root.style.maxWidth).toBe("var(--ds-component-page-widths-content, 1180px)");
    expect(root.style.marginInline).toBe("auto");
    expect(root.style.getPropertyValue("--page-content-padding-x-xs")).toBe(
      "var(--ds-component-page-padding-x-xs, 16px)",
    );
    expect(root.style.getPropertyValue("--page-content-padding-x-md")).toBe(
      "var(--ds-component-page-padding-x-md, 32px)",
    );
  });

  it("supports full width content", () => {
    const { container } = render(
      <PageContent width="full">
        <div>body</div>
      </PageContent>,
    );

    const root = container.firstElementChild as HTMLDivElement;
    expect(root.style.maxWidth).toBe("");
    expect(root.style.marginInline).toBe("");
  });

  it("can disable page padding", () => {
    const { container } = render(
      <PageContent width="form" paddingX="none">
        <div>body</div>
      </PageContent>,
    );

    const root = container.firstElementChild as HTMLDivElement;
    expect(root.style.maxWidth).toBe("var(--ds-component-page-widths-form, 1024px)");
    expect(root.style.getPropertyValue("--page-content-padding-x-xs")).toBe("0px");
    expect(root.style.getPropertyValue("--page-content-padding-x-md")).toBe("0px");
  });
});
