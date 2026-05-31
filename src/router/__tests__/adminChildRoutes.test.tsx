import { adminChildRoutes } from "../adminChildRoutes";

describe("adminChildRoutes", () => {
  it("treats /admin/master/shift as not found", () => {
    const masterRoute = adminChildRoutes.find(
      (route) => route.path === "master",
    );
    const shiftRoute = masterRoute?.children?.find(
      (route) => route.path === "shift",
    );
    const wildcardRoute = masterRoute?.children?.find(
      (route) => route.path === "*",
    );

    expect(shiftRoute).toBeDefined();
    expect(shiftRoute?.lazy).toBeDefined();
    // Same lazy loader as the catch-all wildcard, i.e. routes to NotFound
    expect(shiftRoute?.lazy).toBe(wildcardRoute?.lazy);
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
