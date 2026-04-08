import { render, screen } from "@testing-library/react";

import { PageTitle, SectionTitle, SubsectionTitle } from "./Heading";

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
});
