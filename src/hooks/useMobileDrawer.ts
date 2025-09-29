import { useState } from "react";

/**
 * モバイルメニューのDrawer状態管理フック
 */
export const useMobileDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer =
    (open: boolean) => (event?: React.KeyboardEvent | React.MouseEvent) => {
      // キーボードイベントの場合、Tab/Shiftキーは除外
      if (
        event &&
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setIsOpen(open);
    };

  // Drawer の onClose 用の単純な関数
  const closeDrawer = () => setIsOpen(false);
  const openDrawer = () => setIsOpen(true);

  return {
    isOpen,
    toggleDrawer,
    closeDrawer,
    openDrawer,
  };
};
