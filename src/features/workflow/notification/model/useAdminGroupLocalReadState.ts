import { useCallback, useMemo } from "react";

export function useAdminGroupLocalReadState(cognitoUserId: string | undefined) {
  const adminGroupReadStorageKey = useMemo(
    () =>
      cognitoUserId
        ? `workflowNotificationRead.workflowComment.${cognitoUserId}`
        : null,
    [cognitoUserId],
  );

  const getLocallyReadAdminIds = useCallback(() => {
    if (!adminGroupReadStorageKey || typeof window === "undefined") {
      return new Set<string>();
    }
    try {
      const raw = window.localStorage.getItem(adminGroupReadStorageKey);
      if (!raw) return new Set<string>();
      const parsed = JSON.parse(raw) as string[];
      if (!Array.isArray(parsed)) return new Set<string>();
      return new Set(parsed.filter((id): id is string => typeof id === "string"));
    } catch {
      return new Set<string>();
    }
  }, [adminGroupReadStorageKey]);

  const saveLocallyReadAdminIds = useCallback(
    (ids: Set<string>) => {
      if (!adminGroupReadStorageKey || typeof window === "undefined") return;
      window.localStorage.setItem(adminGroupReadStorageKey, JSON.stringify([...ids]));
    },
    [adminGroupReadStorageKey],
  );

  const markAdminGroupEventAsReadLocally = useCallback(
    (eventId: string) => {
      const current = getLocallyReadAdminIds();
      if (current.has(eventId)) return false;
      current.add(eventId);
      saveLocallyReadAdminIds(current);
      return true;
    },
    [getLocallyReadAdminIds, saveLocallyReadAdminIds],
  );

  return { getLocallyReadAdminIds, markAdminGroupEventAsReadLocally };
}
