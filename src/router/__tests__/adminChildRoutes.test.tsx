import React from "react";

import NotFound from "@/pages/NotFound";

import { adminChildRoutes } from "../adminChildRoutes";

describe("adminChildRoutes", () => {
  it("treats /admin/master/shift as not found", () => {
    const masterRoute = adminChildRoutes.find((route) => route.path === "master");
    const shiftRoute = masterRoute?.children?.find(
      (route) => route.path === "shift",
    );

    expect(shiftRoute).toBeDefined();
    expect(shiftRoute?.element).toBeDefined();
    expect(React.isValidElement(shiftRoute?.element)).toBe(true);
    expect((shiftRoute?.element as React.ReactElement).type).toBe(NotFound);
  });

  it("registers /admin/workflow with index and :id children", () => {
    const workflowRoute = adminChildRoutes.find(
      (route) => route.path === "workflow",
    );

    expect(workflowRoute).toBeDefined();
    expect(workflowRoute?.children).toBeDefined();

    const indexRoute = workflowRoute?.children?.find((r) => r.index === true);
    const detailRoute = workflowRoute?.children?.find((r) => r.path === ":id");

    expect(indexRoute).toBeDefined();
    expect(detailRoute).toBeDefined();
  });
});
