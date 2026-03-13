import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import CommonBreadcrumbs from "./CommonBreadcrumbs";

describe("CommonBreadcrumbs", () => {
  it("renders breadcrumb items as router links for internal paths", () => {
    render(
      <MemoryRouter>
        <CommonBreadcrumbs
          items={[
            { label: "TOP", href: "/" },
            { label: "ワークフロー", href: "/workflow" },
          ]}
          current="詳細"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "TOP" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "ワークフロー" })).toHaveAttribute(
      "href",
      "/workflow",
    );
    expect(screen.getByText("詳細")).toBeInTheDocument();
  });
});
