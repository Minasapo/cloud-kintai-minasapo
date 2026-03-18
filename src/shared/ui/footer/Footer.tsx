import type { CSSProperties } from "react";

import { designTokenVar } from "@/shared/designSystem";

interface FooterProps {
  themeColor?: string;
}

const FOOTER_ACCENT = designTokenVar("component.footer.accent", "#0B6D53");
const FOOTER_BACKGROUND = designTokenVar(
  "component.footer.background",
  "#F3F8F5",
);
const FOOTER_BORDER = designTokenVar(
  "component.footer.borderColor",
  "rgba(15, 168, 94, 0.12)",
);
const FOOTER_TEXT = designTokenVar("component.footer.textColor", "#45574F");
const FOOTER_MUTED_TEXT = designTokenVar(
  "component.footer.mutedTextColor",
  "#5E726A",
);
const FOOTER_PADDING_X = designTokenVar("component.footer.paddingX", "16px");
const FOOTER_PADDING_Y = designTokenVar("component.footer.paddingY", "14px");
const FOOTER_CONTENT_MAX_WIDTH = designTokenVar(
  "component.footer.contentMaxWidth",
  "960px",
);

const Footer = ({ themeColor }: FooterProps) => (
  <footer
    role="contentinfo"
    className="border-t bg-[linear-gradient(180deg,rgba(248,250,249,0.92)_0%,rgba(236,253,245,0.96)_100%)]"
    style={
      {
        "--footer-accent": themeColor ?? FOOTER_ACCENT,
        "--footer-background": FOOTER_BACKGROUND,
        "--footer-border": FOOTER_BORDER,
        "--footer-text": FOOTER_TEXT,
        "--footer-muted-text": FOOTER_MUTED_TEXT,
        "--footer-padding-x": FOOTER_PADDING_X,
        "--footer-padding-y": FOOTER_PADDING_Y,
        "--footer-content-max-width": FOOTER_CONTENT_MAX_WIDTH,
        borderColor: "var(--footer-border)",
      } as CSSProperties & Record<`--${string}`, string>
    }
  >
    <div className="mx-auto flex w-full max-w-[var(--footer-content-max-width)] flex-col items-center gap-1 px-[var(--footer-padding-x)] py-[var(--footer-padding-y)] text-center">
      <div className="flex min-w-0 items-center justify-center">
        <p
          className="m-0 text-sm font-medium leading-6"
          style={{ color: "var(--footer-text)" }}
        >
          Virtual Tech Japan Inc.
        </p>
      </div>
      <p
        className="m-0 break-words text-xs leading-5"
        style={{ color: "var(--footer-muted-text)" }}
      >
        © 2026 Virtual Tech Japan Inc.
      </p>
    </div>
  </footer>
);

export default Footer;
