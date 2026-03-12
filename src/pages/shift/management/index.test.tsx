import { resolveShiftManagementMode } from "./index";

describe("resolveShiftManagementMode", () => {
  it("returns normal when AppConfig display mode is normal", () => {
    expect(resolveShiftManagementMode("normal")).toBe("normal");
  });

  it("returns collaborative when AppConfig display mode is collaborative", () => {
    expect(resolveShiftManagementMode("collaborative")).toBe("collaborative");
  });
});
