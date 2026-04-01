import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { APP_OVERLAY_PORTAL_ROOT_ID } from "./layers";

type OverlayPortalProps = {
  children: ReactNode;
};

const ensureOverlayRoot = () => {
  const existingRoot = document.getElementById(APP_OVERLAY_PORTAL_ROOT_ID);
  if (existingRoot) {
    return existingRoot;
  }

  const root = document.createElement("div");
  root.id = APP_OVERLAY_PORTAL_ROOT_ID;
  document.body.appendChild(root);
  return root;
};

export default function OverlayPortal({ children }: OverlayPortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(ensureOverlayRoot());
  }, []);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
}
