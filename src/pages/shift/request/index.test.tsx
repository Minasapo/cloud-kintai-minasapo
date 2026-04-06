import { resolveShiftRequestMode } from "./index";

describe("resolveShiftRequestMode", () => {
  it("returns normal when AppConfig display mode is normal", () => {
    expect(resolveShiftRequestMode("normal", true)).toBe("normal");
  });

  it("returns collaborative when AppConfig display mode is collaborative and collaborative is enabled", () => {
    expect(resolveShiftRequestMode("collaborative", true)).toBe(
      "collaborative",
    );
  });

  it("returns normal when AppConfig display mode is collaborative but collaborative is disabled", () => {
    expect(resolveShiftRequestMode("collaborative", false)).toBe("normal");
  });
});
