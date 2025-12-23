import ExternalLinksView, {
  ExternalLinkItem,
} from "@shared/ui/header/ExternalLinks";
import { useContext, useEffect, useMemo, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import { StaffExternalLink } from "@/entities/staff/externalLink";
import fetchStaff from "@/hooks/useStaff/fetchStaff";

export function ExternalLinks() {
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const { getLinks } = useContext(AppConfigContext);
  const [companyLinks, setCompanyLinks] = useState<ExternalLinkItem[]>([]);
  const [personalLinks, setPersonalLinks] = useState<ExternalLinkItem[]>([]);

  useEffect(() => {
    const resolvedLinks =
      typeof getLinks === "function" ? filterEnabledLinks(getLinks()) : [];
    setCompanyLinks(resolvedLinks);
  }, [getLinks]);

  useEffect(() => {
    if (!cognitoUser) {
      setPersonalLinks([]);
      return;
    }

    let cancelled = false;
    fetchStaff(cognitoUser.id)
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
  }, [cognitoUser?.id]);

  const { familyName = "", givenName = "" } = cognitoUser ?? {};

  const staffName = useMemo(() => {
    const names = [familyName, givenName]
      .map((name) => name.trim())
      .filter(Boolean);
    return names.join(" ");
  }, [familyName, givenName]);

  const mergedLinks = useMemo(
    () => [...companyLinks, ...personalLinks],
    [companyLinks, personalLinks]
  );

  if (authStatus !== "authenticated" || !cognitoUser) {
    return null;
  }

  return <ExternalLinksView links={mergedLinks} staffName={staffName} />;
}

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
