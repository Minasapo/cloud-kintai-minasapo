import { shouldRedirectFromCollaborativeRoute } from "./index";

describe("shouldRedirectFromCollaborativeRoute", () => {
  it("returns true when mode is normal", () => {
    expect(shouldRedirectFromCollaborativeRoute("normal")).toBe(true);
  });

  it("returns false when mode is collaborative", () => {
    expect(shouldRedirectFromCollaborativeRoute("collaborative")).toBe(false);
  });
});
