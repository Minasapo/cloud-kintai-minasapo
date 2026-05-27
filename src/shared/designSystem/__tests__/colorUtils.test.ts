import { hexToRgba, normalizeHex, shade, tint } from "../colorUtils";

describe("normalizeHex", () => {
  it.each([
    ["#abc", "#AABBCC"],
    ["abc", "#AABBCC"],
    ["a1b2c3", "#A1B2C3"],
    ["  #ff00aa  ", "#FF00AA"],
  ])("%s を %s に正規化すること", (input, expected) => {
    expect(normalizeHex(input)).toBe(expected);
  });
});

describe("hexToRgba", () => {
  it("HEX を rgba に変換すること", () => {
    expect(hexToRgba("#1EAA6A", 0.4)).toBe("rgba(30, 170, 106, 0.4)");
  });

  it("alpha が 0 の場合も変換できること", () => {
    expect(hexToRgba("fff", 0)).toBe("rgba(255, 255, 255, 0)");
  });

  it("alpha が 1 の場合も変換できること", () => {
    expect(hexToRgba("000000", 1)).toBe("rgba(0, 0, 0, 1)");
  });
});

describe("tint", () => {
  it("amount が 0 の場合は色が変化しないこと", () => {
    expect(tint("#336699", 0)).toBe("#336699");
  });

  it("amount が 100 の場合は白まで補正されること", () => {
    expect(tint("#336699", 100)).toBe("#FFFFFF");
  });
});

describe("shade", () => {
  it("amount が 0 の場合は色が変化しないこと", () => {
    expect(shade("#336699", 0)).toBe("#336699");
  });

  it("amount が 100 の場合は黒まで補正されること", () => {
    expect(shade("#336699", 100)).toBe("#000000");
  });
});
