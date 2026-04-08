import { render, screen } from "@testing-library/react";

import { Heading, PageTitle, SectionTitle, SubsectionTitle } from "./Heading";

describe("Heading", () => {
  it("renders the default semantic element for each role", () => {
    render(
      <>
        <PageTitle>ページ見出し</PageTitle>
        <SectionTitle>セクション見出し</SectionTitle>
        <SubsectionTitle>補助見出し</SubsectionTitle>
      </>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "ページ見出し" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "セクション見出し" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "補助見出し" }),
    ).toBeInTheDocument();
  });

  it("allows overriding the semantic element", () => {
    render(<SectionTitle as="h3">別レベル見出し</SectionTitle>);

    expect(
      screen.getByRole("heading", { level: 3, name: "別レベル見出し" }),
    ).toBeInTheDocument();
  });

  it("uses appearance defaults for each level", () => {
    render(
      <>
        <PageTitle>ページ見出し</PageTitle>
        <SectionTitle>セクション見出し</SectionTitle>
        <SubsectionTitle>補助見出し</SubsectionTitle>
      </>,
    );

    const pageHeading = screen.getByRole("heading", { level: 1 });
    const sectionHeading = screen.getByRole("heading", { level: 2 });
    const subsectionHeading = screen.getByRole("heading", { level: 3 });

    expect(pageHeading.getAttribute("style")).toContain(
      "--ds-component-heading-appearance-hero-max-width",
    );
    expect(pageHeading.getAttribute("style")).not.toContain("border-left:");
    expect(pageHeading.getAttribute("style")).not.toContain("border-bottom:");
    expect(sectionHeading.getAttribute("style")).toContain(
      "--ds-component-heading-appearance-standard-max-width",
    );
    expect(sectionHeading.getAttribute("style")).not.toContain("border-left:");
    expect(subsectionHeading.getAttribute("style")).not.toContain(
      "border-left:",
    );
  });

  it("allows quiet appearance on a section heading without changing semantics", () => {
    render(
      <Heading level="section" appearance="quiet">
        静かなセクション見出し
      </Heading>,
    );

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "静かなセクション見出し",
    });

    expect(heading).toBeInTheDocument();
    expect(heading.getAttribute("style")).toContain(
      "--ds-component-heading-appearance-quiet-max-width",
    );
    expect(heading.getAttribute("style")).not.toContain("border-left:");
  });
});
