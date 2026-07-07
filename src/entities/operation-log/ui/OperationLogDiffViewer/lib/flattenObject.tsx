import { isPlainObject } from "./isPlainObject";

export function flattenObject(
  obj: unknown,
  prefix = "",
  depth = 0,
): Record<string, unknown> {
  if (depth > 10) return {};

  if (!isPlainObject(obj)) {
    return prefix ? { [prefix]: obj } : {};
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      const nested = flattenObject(value, fullKey, depth + 1);
      Object.assign(result, nested);
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}
