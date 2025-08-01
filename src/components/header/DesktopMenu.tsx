/**
 * デスクトップ用のメニューコンポーネント。
 * ユーザーのロールやメール認証状態に応じて表示するメニュー項目を切り替えます。
 *
 * @param pathName 現在のパス名
 * @returns メニューのReact要素
 */

import { useAuthenticator } from "@aws-amplify/ui-react";
import { Box, Stack } from "@mui/material";
import { useContext, useEffect, useState } from "react";

import { AppConfigContext } from "../../context/AppConfigContext";
import { AuthContext } from "../../context/AuthContext";
import { StaffRole } from "../../hooks/useStaffs/useStaffs";
import Link from "../link/Link";

export default function DesktopMenu({ pathName }: { pathName: string }) {
  const { isCognitoUserRole } = useContext(AuthContext);
  const { getOfficeMode } = useContext(AppConfigContext);
  const [officeMode, setOfficeMode] = useState<boolean>(false);

  useEffect(() => {
    setOfficeMode(getOfficeMode());
  }, [getOfficeMode]);

  const viewableList = [];
  const menuList = [
    { label: "勤怠打刻", href: "/register" },
    { label: "勤怠一覧", href: "/attendance/list" },
    // { label: "ドキュメント", href: "/docs" },
  ];

  const adminMenuList = [
    { label: "スタッフ管理", href: "/admin/staff" },
    { label: "勤怠管理", href: "/admin/attendances" },
    { label: "マスタ管理", href: "/admin/master" },
  ];

  const operatorMenuList = officeMode
    ? [{ label: "QR表示", href: "/office/qr" }]
    : [];

  // システム管理者、スタッフ管理者
  const { user } = useAuthenticator();
  const isMailVerified = user?.attributes?.email_verified ? true : false;

  if (isMailVerified) {
    if (
      isCognitoUserRole(StaffRole.ADMIN) ||
      isCognitoUserRole(StaffRole.STAFF_ADMIN)
    ) {
      viewableList.push(...menuList, ...adminMenuList, ...operatorMenuList);
    } else if (isCognitoUserRole(StaffRole.STAFF)) {
      viewableList.push(...menuList);
    } else if (isCognitoUserRole(StaffRole.OPERATOR)) {
      viewableList.push(...operatorMenuList);
    }
  }

  return (
    <Box
      sx={{
        width: 1,
        height: 1,
        display: {
          xs: "none",
          md: "block",
        },
      }}
    >
      <Stack direction="row" spacing={0} sx={{ width: "auto", height: 1 }}>
        {viewableList.map((menu, index) => (
          <Box key={index}>
            <Link
              label={menu.label}
              href={menu.href}
              sx={{
                display: "block",
                height: 1,
                lineHeight: "32px",
                px: 1,
                color: pathName === menu.href ? "#0FA85E" : "white",
                backgroundColor: pathName === menu.href ? "white" : "inherit",
                textDecoration: "none",
              }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
