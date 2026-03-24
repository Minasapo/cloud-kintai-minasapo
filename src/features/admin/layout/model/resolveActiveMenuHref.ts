import type { AdminHeaderMenuItem } from "@/features/admin/layout/model/useHeaderMenu";

const STAFF_ATTENDANCE_PATH_PATTERN =
  /^\/admin\/staff\/[^/]+\/attendance(?:\/|$)/;

type ResolveActiveMenuHrefParams = {
  currentPath: string;
  menuItems: readonly Pick<AdminHeaderMenuItem, "href">[];
};

export const resolveActiveMenuHref = ({
  currentPath,
  menuItems,
}: ResolveActiveMenuHrefParams): string => {
  if (STAFF_ATTENDANCE_PATH_PATTERN.test(currentPath)) {
    return "/admin/attendances";
  }

  const exactMatch = menuItems.find((item) => item.href === currentPath);
  if (exactMatch) {
    return exactMatch.href;
  }

  const longestPrefixMatch = menuItems
    .filter((item) => currentPath.startsWith(`${item.href}/`))
    .toSorted((left, right) => right.href.length - left.href.length)[0];

  return longestPrefixMatch?.href ?? menuItems[0]?.href ?? "";
};
