import { resolveShiftManagementMode } from "./index";

describe("resolveShiftManagementMode", () => {
  it("returns normal when collaborative mode is disabled", () => {
    expect(resolveShiftManagementMode(false, "collaborative")).toBe("normal");
  });

  it("returns normal when AppConfig default mode is normal", () => {
    expect(resolveShiftManagementMode(true, "normal")).toBe("normal");
  });

  it("returns collaborative when enabled and AppConfig default mode is collaborative", () => {
    expect(resolveShiftManagementMode(true, "collaborative")).toBe(
      "collaborative",
    );
  });
});
