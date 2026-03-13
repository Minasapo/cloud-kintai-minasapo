import Logo from "@shared/ui/logo/Logo";
import { useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { resolveThemeColor } from "@/shared/config/theme";
import { designTokenVar } from "@/shared/designSystem";
import HeaderBar from "@/shared/ui/header/HeaderBar";

import AdminPendingApprovalSummary from "./AdminPendingApprovalSummary";
import { ExternalLinks } from "./ExternalLinks/ExternalLinks";
import NavigationMenu from "./NavigationMenu";
import { SignInOutButton } from "./SignInOutButton";
import WorkflowNotificationButton from "./WorkflowNotificationButton";

export default function Header() {
  const { getThemeColor } = useContext(AppConfigContext);

  const resolvedThemeColor = useMemo(
    () =>
      resolveThemeColor(
        typeof getThemeColor === "function" ? getThemeColor() : undefined,
      ),
    [getThemeColor],
  );
  const headerThemeColor = designTokenVar(
    "color.brand.primary.base",
    resolvedThemeColor,
  );

  return (
    <HeaderBar
      themeColor={headerThemeColor}
      logo={<Logo />}
      navigation={<NavigationMenu />}
      centerContent={<AdminPendingApprovalSummary />}
      notificationsButton={<WorkflowNotificationButton />}
      externalLinks={<ExternalLinks />}
      signInOutButton={<SignInOutButton />}
    />
  );
}
