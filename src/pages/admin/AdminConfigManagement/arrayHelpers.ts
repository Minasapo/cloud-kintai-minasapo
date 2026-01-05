export const appendItem = <T>(list: T[], item: T): T[] => [...list, item];

export const updateItem = <T>(
  list: T[],
  index: number,
  updater: (prev: T) => T
): T[] =>
  list.map((current, currentIndex) =>
    currentIndex === index ? updater(current) : current
  );

export const removeItemAt = <T>(list: T[], index: number): T[] =>
  list.filter((_, currentIndex) => currentIndex !== index);

export const toggleEnabledAt = <T extends { enabled: boolean }>(
  list: T[],
  index: number
): T[] =>
  updateItem(list, index, (item) => ({ ...item, enabled: !item.enabled }));
