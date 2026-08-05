import { alphaColor } from "../color";

describe("alphaColor", () => {
  describe("rgb input", () => {
    it("rgb 入力を指定 alpha の rgba に変換すること", () => {
      expect(alphaColor("rgb(255, 128, 0)", 0.5)).toBe("rgba(255, 128, 0, 0.5)");
    });
  });

  describe("rgba input", () => {
    it("既存 alpha を新しい値に置き換えること", () => {
      expect(alphaColor("rgba(255, 128, 0, 0.8)", 0.2)).toBe("rgba(255, 128, 0, 0.2)");
    });

    it("小数値の alpha に置き換えること", () => {
      expect(alphaColor("rgba(100, 200, 50, 1)", 0)).toBe("rgba(100, 200, 50, 0)");
    });
  });

  describe("hex input", () => {
    it("6桁 hex を rgba に変換すること", () => {
      expect(alphaColor("#ff8000", 0.5)).toBe("rgba(255, 128, 0, 0.5)");
    });

    it("# なし hex を処理できること", () => {
      expect(alphaColor("ff8000", 0.3)).toBe("rgba(255, 128, 0, 0.3)");
    });

    it("3桁 hex を 6桁に展開すること", () => {
      expect(alphaColor("#fff", 1)).toBe("rgba(255, 255, 255, 1)");
    });

    it("# なし 3桁 hex を展開すること", () => {
      expect(alphaColor("f0f", 0.5)).toBe("rgba(255, 0, 255, 0.5)");
    });

    it("大文字小文字混在の hex を処理できること", () => {
      expect(alphaColor("#FF8000", 0.5)).toBe("rgba(255, 128, 0, 0.5)");
    });

    it("黒色 hex を処理できること", () => {
      expect(alphaColor("#000000", 0.1)).toBe("rgba(0, 0, 0, 0.1)");
    });

    it("白色 hex を処理できること", () => {
      expect(alphaColor("#ffffff", 1)).toBe("rgba(255, 255, 255, 1)");
    });
  });

  describe("invalid input", () => {
    it("不正な hex 入力は元の文字列を返すこと", () => {
      expect(alphaColor("not-a-color", 0.5)).toBe("not-a-color");
    });

    it("不完全な hex は元の文字列を返すこと", () => {
      expect(alphaColor("#abc1", 0.5)).toBe("#abc1");
    });
  });
});
