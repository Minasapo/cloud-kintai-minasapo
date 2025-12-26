import { nonNullable } from "../appConfigApi";

describe("appConfigApi utils", () => {
  it("nonNullable filters out null and undefined", () => {
    const input = ["a", null, undefined, "b", 0, false];
    const result = input.filter(nonNullable);

    expect(result).toEqual(["a", "b", 0, false]);
  });
});
