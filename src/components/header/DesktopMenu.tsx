/**
 * デスクトップ用のメニューコンポーネント。
 * ユーザーのロールやメール認証状態に応じて表示するメニュー項目を切り替えます。
 *
 * @param pathName 現在のパス名
 * @returns メニューのReact要素
 */

import { useAuthenticator } from "@aws-amplify/ui-react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  Stack,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";

import { AppConfigContext } from "../../context/AppConfigContext";
import { AuthContext } from "../../context/AuthContext";
import useAuthenticatedUser from "../../hooks/useAuthenticatedUser";
import fetchStaff from "../../hooks/useStaff/fetchStaff";
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
    { label: "シフト", href: "/shift" },
    { label: "ワークフロー", href: "/workflow" },
    // { label: "ドキュメント", href: "/docs" },
  ];

  const adminMenuList = [
    { label: "スタッフ管理", href: "/admin/staff" },
    { label: "勤怠管理", href: "/admin/attendances" },
    { label: "シフト管理", href: "/admin/shift" },
    { label: "ワークフロー管理", href: "/admin/workflow" },
  ];

  // 設定（マスタ管理）の独立表示（管理配下から外す）
  const settingsMenu = { label: "設定", href: "/admin/master" };

  // 管理メニュー用のアンカー制御
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const operatorMenuList = officeMode
    ? [{ label: "QR表示", href: "/office/qr" }]
    : [];

  // システム管理者、スタッフ管理者
  const { user } = useAuthenticator();
  const isMailVerified = user?.attributes?.email_verified ? true : false;

  // developer flag for current staff (used to hide admin shift link)
  const { authenticatedUser } = useAuthenticatedUser();
  const [isDeveloper, setIsDeveloper] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!authenticatedUser?.cognitoUserId) {
        if (mounted) setIsDeveloper(false);
        return;
      }
      try {
        const staff = await fetchStaff(authenticatedUser.cognitoUserId);
        const developerFlag = (staff as unknown as Record<string, unknown>)
          .developer as boolean | undefined;
        if (mounted) setIsDeveloper(Boolean(developerFlag));
      } catch (e) {
        if (mounted) setIsDeveloper(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [authenticatedUser]);

  if (isMailVerified) {
    if (
      isCognitoUserRole(StaffRole.ADMIN) ||
      isCognitoUserRole(StaffRole.STAFF_ADMIN)
    ) {
      // 通常メニューはフラットに追加。管理はドロップダウンで表示する
      // hide top-level "シフト" for non-developers
      const filteredMenuList = menuList.filter((m) => {
        if (m.href === "/shift") return isDeveloper === true;
        return true;
      });
      viewableList.push(...filteredMenuList, ...operatorMenuList);
    } else if (isCognitoUserRole(StaffRole.STAFF)) {
      const filteredMenuList = menuList.filter((m) => {
        if (m.href === "/shift") return isDeveloper === true;
        return true;
      });
      viewableList.push(...filteredMenuList);
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
                "&:hover, &:focus": {
                  // フォーカスやホバーで背景色が変わらないようにする
                  backgroundColor: pathName === menu.href ? "white" : "inherit",
                  color: pathName === menu.href ? "#0FA85E" : "white",
                },
                textDecoration: "none",
              }}
            />
          </Box>
        ))}

        {/* 管理ドロップダウン（管理者のみ表示） */}
        {(isCognitoUserRole(StaffRole.ADMIN) ||
          isCognitoUserRole(StaffRole.STAFF_ADMIN)) && (
          <Box>
            <Button
              onClick={handleOpen}
              aria-controls={open ? "admin-menu" : undefined}
              aria-expanded={open ? "true" : undefined}
              aria-haspopup="menu"
              endIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                // 色を常に白に固定（開閉で色を変えない）
                color: "white",
                backgroundColor: "inherit",
                height: 1,
                lineHeight: "32px",
                px: 1,
                textTransform: "none",
                textDecoration: "none",
                "&:focus": {
                  outline: "none",
                  // フォーカス時も背景を変えない
                  backgroundColor: "inherit",
                },
              }}
            >
              管理
            </Button>
            <MuiMenu
              id="admin-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              {adminMenuList
                .filter((m) => {
                  if (m.href === "/admin/shift") {
                    // only show shift management link when staff has developer flag
                    return isDeveloper === true;
                  }
                  return true;
                })
                .map((m) => (
                  <MuiMenuItem
                    key={m.href}
                    onClick={() => {
                      handleClose();
                      window.location.href = m.href;
                    }}
                  >
                    {m.label}
                  </MuiMenuItem>
                ))}
            </MuiMenu>
          </Box>
        )}
        {/* 設定は管理ボタンの後に表示（管理者のみ） */}
        {(isCognitoUserRole(StaffRole.ADMIN) ||
          isCognitoUserRole(StaffRole.STAFF_ADMIN)) && (
          <Box>
            <Link
              label={settingsMenu.label}
              href={settingsMenu.href}
              sx={{
                display: "block",
                height: 1,
                lineHeight: "32px",
                px: 1,
                color: pathName === settingsMenu.href ? "#0FA85E" : "white",
                backgroundColor:
                  pathName === settingsMenu.href ? "white" : "inherit",
                "&:hover, &:focus": {
                  backgroundColor:
                    pathName === settingsMenu.href ? "white" : "inherit",
                  color: pathName === settingsMenu.href ? "#0FA85E" : "white",
                },
                textDecoration: "none",
              }}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}
