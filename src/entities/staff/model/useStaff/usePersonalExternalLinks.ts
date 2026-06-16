import type { StaffExternalLink } from "@entities/staff/externalLink";
import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { createLogger } from "@shared/lib/logger";
import type { ExternalLinkItem } from "@shared/ui/header/ExternalLinks";
import { useEffect, useState } from "react";

const logger = createLogger("usePersonalExternalLinks");

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
 * @returns スタッフの個人用外部リンク情報
 */
export function usePersonalExternalLinks(
  cognitoUserId: string | undefined
): { personalLinks: ExternalLinkItem[]; hasFetchError: boolean } {
  const [personalLinks, setPersonalLinks] = useState<ExternalLinkItem[]>([]);
  const [hasFetchError, setHasFetchError] = useState(false);

  useEffect(() => {
    if (!cognitoUserId) {
      return;
    }

    let cancelled = false;

   fetchStaff(cognitoUserId)
     .then((staff) => {
       if (cancelled) return;
       const links = normalizeStaffExternalLinks(staff?.externalLinks);
       setPersonalLinks(links);
       setHasFetchError(false);
     })
     .catch((error) => {
       if (cancelled) return;

       logger.error("Failed to fetch personal external links", {
         cognitoUserId,
         error,
       });
       setHasFetchError(true);
     });

   return () => {
     cancelled = true;
   };
  }, [cognitoUserId]);

  return { personalLinks, hasFetchError };
}
