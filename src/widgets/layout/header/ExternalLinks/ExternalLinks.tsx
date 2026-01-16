import ExternalLinksView, {
  ExternalLinkItem,
} from "@shared/ui/header/ExternalLinks";
import { useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import { usePersonalExternalLinks } from "@/hooks/useStaff/usePersonalExternalLinks";

export function ExternalLinks() {
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const { getLinks } = useContext(AppConfigContext);

  const companyLinks = useMemo<ExternalLinkItem[]>(() => {
    const resolvedLinks =
      typeof getLinks === "function" ? filterEnabledLinks(getLinks()) : [];
    return resolvedLinks;
  }, [getLinks]);

  const personalLinks = usePersonalExternalLinks(cognitoUser?.id);

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
