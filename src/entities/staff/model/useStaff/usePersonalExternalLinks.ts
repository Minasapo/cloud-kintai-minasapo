import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import type { ExternalLinkItem } from "@shared/ui/header/ExternalLinks";
import { useEffect, useState } from "react";

import type { StaffExternalLink } from "@/entities/staff/externalLink";

const filterEnabledLinks = (links: ExternalLinkItem[]) =>
  links.filter(
    (link) =>
      Boolean(link.enabled) &&
      typeof link.label === "string" &&
      link.label.trim() !== "" &&
      typeof link.url === "string" &&
      link.url.trim() !== ""
  );

const normalizeStaffExternalLinks = (
  links?: (StaffExternalLink | null)[] | null
): ExternalLinkItem[] => {
  if (!links) {
    return [];
  }

  return filterEnabledLinks(
    links
      .filter((link): link is NonNullable<typeof link> => Boolean(link))
      .map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
        enabled: link.enabled,
        icon: link.icon || "LinkIcons",
        isPersonal: true,
      }))
  );
};

/**
 * スタッフの個人用外部リンクを取得するカスタムフック
 * @param cognitoUserId CognitoユーザーID
 * @returns スタッフの個人用外部リンク配列
 */
export function usePersonalExternalLinks(
  cognitoUserId: string | undefined
): ExternalLinkItem[] {
  const [personalLinks, setPersonalLinks] = useState<ExternalLinkItem[]>([]);

  useEffect(() => {
    if (!cognitoUserId) {
      // cognitoUserIdがundefinedの場合は空配列を返す
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPersonalLinks([]);
      return;
    }

    let cancelled = false;

    // 新しいフェッチが開始される際に前の結果をクリア
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPersonalLinks([]);

    fetchStaff(cognitoUserId)
      .then((staff) => {
        if (cancelled) return;
        const links = normalizeStaffExternalLinks(staff?.externalLinks);
        setPersonalLinks(links);
      })
      .catch(() => {
        if (!cancelled) {
          setPersonalLinks([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cognitoUserId]);

  return personalLinks;
}
