/**
 * デスクトップ用のメニューコンポーネント。
 * ユーザーのロールやメール認証状態に応じて表示するメニュー項目を切り替えます。
 *
 * @param pathName 現在のパス名
 * @returns メニューのReact要素
 */

import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import DesktopMenuView, {
  DesktopMenuItem,
} from "@shared/ui/header/DesktopMenu";
import { useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";

export default function DesktopMenu({ pathName }: { pathName: string }) {
  const { isCognitoUserRole, cognitoUser } = useContext(AuthContext);
  const { getOfficeMode, getAttendanceStatisticsEnabled } =
    useContext(AppConfigContext);

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

  const officeMode = getOfficeMode();
  const attendanceStatisticsEnabled = getAttendanceStatisticsEnabled();

  const operatorMenuList: DesktopMenuItem[] = officeMode
    ? [{ label: "QR表示", href: "/office/qr" }]
    : [];

  const isMailVerified = Boolean(cognitoUser?.emailVerified);

  const isAdminUser = useMemo(
    () =>
      isCognitoUserRole(StaffRole.ADMIN) ||
      isCognitoUserRole(StaffRole.STAFF_ADMIN),
    [isCognitoUserRole]
  );

  const menuItems = useMemo(() => {
    const filteredMenuList = menuList.filter((menu) => {
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
