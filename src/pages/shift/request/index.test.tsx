import { resolveShiftRequestMode } from "./index";

describe("resolveShiftRequestMode", () => {
  it("returns normal when AppConfig display mode is normal", () => {
    expect(resolveShiftRequestMode("normal")).toBe("normal");
  });

  it("returns collaborative when AppConfig display mode is collaborative", () => {
    expect(resolveShiftRequestMode("collaborative")).toBe("collaborative");
  });
});
