import {
  appendItem,
  removeItemAt,
  toggleEnabledAt,
  updateItem,
} from "../arrayHelpers";

describe("arrayHelpers", () => {
  test("appendItem adds item to end", () => {
    const arr = [1, 2];
    const res = appendItem(arr, 3);
    expect(res).toEqual([1, 2, 3]);
    // original not mutated
    expect(arr).toEqual([1, 2]);
  });

  test("updateItem updates item at index via updater", () => {
    const arr = [{ v: 1 }, { v: 2 }];
    const res = updateItem(arr, 1, (prev) => ({ ...prev, v: 5 }));
    expect(res).toEqual([{ v: 1 }, { v: 5 }]);
    // out of bounds returns original elements unchanged
    const res2 = updateItem(arr, 5, (p) => ({ ...p }));
    expect(res2).toEqual(arr);
  });

  test("removeItemAt removes item at index", () => {
    const arr = ["a", "b", "c"];
    const res = removeItemAt(arr, 1);
    expect(res).toEqual(["a", "c"]);
    // out of bounds -> original
    expect(removeItemAt(arr, 10)).toEqual(arr);
  });

  test("toggleEnabledAt toggles enabled flag", () => {
    const arr = [{ enabled: true }, { enabled: false }];
    const res = toggleEnabledAt(arr, 0);
    expect(res[0].enabled).toBe(false);
    expect(res[1].enabled).toBe(false);
    // other indices unaffected
    const res2 = toggleEnabledAt(arr, 1);
    expect(res2[0].enabled).toBe(true);
    expect(res2[1].enabled).toBe(true);
  });
});
