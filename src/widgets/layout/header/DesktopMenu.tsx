/**
 * デスクトップ用のメニューコンポーネント。
 * ユーザーのロールやメール認証状態に応じて表示するメニュー項目を切り替えます。
 *
 * @param pathName 現在のパス名
 * @returns メニューのReact要素
 */

import DesktopMenuView, {
  DesktopMenuItem,
} from "@shared/ui/header/DesktopMenu";
import { useContext, useEffect, useMemo, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import { StaffRole } from "@/hooks/useStaffs/useStaffs";

export default function DesktopMenu({ pathName }: { pathName: string }) {
  const { isCognitoUserRole, cognitoUser } = useContext(AuthContext);
  const { getOfficeMode, getAttendanceStatisticsEnabled } =
    useContext(AppConfigContext);
  const [officeMode, setOfficeMode] = useState<boolean>(false);
  const [attendanceStatisticsEnabled, setAttendanceStatisticsEnabled] =
    useState<boolean>(true);

  useEffect(() => {
    setOfficeMode(getOfficeMode());
    setAttendanceStatisticsEnabled(getAttendanceStatisticsEnabled());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menuList = useMemo<DesktopMenuItem[]>(
    () => [
      { label: "勤怠打刻", href: "/register" },
      { label: "勤怠一覧", href: "/attendance/list" },
      { label: "稼働統計", href: "/attendance/stats" },
      { label: "日報", href: "/attendance/report" },
      { label: "シフト", href: "/shift" },
      { label: "ワークフロー", href: "/workflow" },
    ],
    []
  );

  const adminLink = useMemo<DesktopMenuItem>(
    () => ({ label: "管理", href: "/admin" }),
    []
  );

  const operatorMenuList: DesktopMenuItem[] = officeMode
    ? [{ label: "QR表示", href: "/office/qr" }]
    : [];

  const isMailVerified = Boolean(cognitoUser?.emailVerified);

  // developer flag for current staff (used to hide admin shift link)
  const [isDeveloper, setIsDeveloper] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!cognitoUser?.id) {
        if (mounted) setIsDeveloper(false);
        return;
      }
      try {
        const staff = await fetchStaff(cognitoUser.id);
        const developerFlag = (staff as unknown as Record<string, unknown>)
          .developer as boolean | undefined;
        if (mounted) setIsDeveloper(Boolean(developerFlag));
      } catch {
        if (mounted) setIsDeveloper(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [cognitoUser]);

  const isAdminUser = useMemo(
    () =>
      isCognitoUserRole(StaffRole.ADMIN) ||
      isCognitoUserRole(StaffRole.STAFF_ADMIN),
    [isCognitoUserRole]
  );

  const menuItems = useMemo(() => {
    const filteredMenuList = menuList.filter((menu) => {
      if (menu.href === "/shift") {
        return isDeveloper === true;
      }
      if (menu.href === "/attendance/stats") {
        return attendanceStatisticsEnabled;
      }
      return true;
    });

    if (!isMailVerified) return [];

    if (isAdminUser) {
      return [...filteredMenuList, ...operatorMenuList];
    }

    if (isCognitoUserRole(StaffRole.STAFF)) {
      return filteredMenuList;
    }

    if (isCognitoUserRole(StaffRole.OPERATOR)) {
      return operatorMenuList;
    }

    return [];
  }, [
    isMailVerified,
    isAdminUser,
    isCognitoUserRole,
    operatorMenuList,
    menuList,
    isDeveloper,
    attendanceStatisticsEnabled,
  ]);

  return (
    <DesktopMenuView
      pathName={pathName}
      menuItems={menuItems}
      adminLink={adminLink}
      showAdminMenu={isAdminUser}
    />
  );
}
