import ExternalLinksView, {
  ExternalLinkItem,
} from "@shared/ui/header/ExternalLinks";
import { useContext, useEffect, useMemo, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";

export function ExternalLinks() {
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const { getLinks } = useContext(AppConfigContext);
  const [links, setLinks] = useState<ExternalLinkItem[]>([]);

  useEffect(() => {
    setLinks(getLinks());
  }, [getLinks]);

  const { familyName = "", givenName = "" } = cognitoUser ?? {};

  const staffName = useMemo(() => {
    const names = [familyName, givenName]
      .map((name) => name.trim())
      .filter(Boolean);
    return names.join(" ");
  }, [familyName, givenName]);

  if (authStatus !== "authenticated" || !cognitoUser) {
    return null;
  }

  return <ExternalLinksView links={links} staffName={staffName} />;
}
