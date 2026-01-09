import { useEffect, useState } from "react";

import fetchStaff from "./fetchStaff";

/**
 * スタッフのdeveloperフラグを取得するカスタムフック
 * @param cognitoUserId CognitoユーザーID
 * @returns { isDeveloper: boolean | null, loading: boolean }
 */
export function useDeveloperFlag(cognitoUserId: string | undefined) {
  const [isDeveloper, setIsDeveloper] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDeveloperFlag() {
      if (!cognitoUserId) {
        if (mounted) {
          setIsDeveloper(false);
          setLoading(false);
        }
        return;
      }

      try {
        const staff = await fetchStaff(cognitoUserId);
        const developerFlag = (staff as unknown as Record<string, unknown>)
          .developer as boolean | undefined;
        if (mounted) {
          setIsDeveloper(Boolean(developerFlag));
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setIsDeveloper(false);
          setLoading(false);
        }
      }
    }

    loadDeveloperFlag();

    return () => {
      mounted = false;
    };
  }, [cognitoUserId]);

  return { isDeveloper, loading };
}
