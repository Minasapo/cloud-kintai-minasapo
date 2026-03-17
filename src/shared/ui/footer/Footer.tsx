import type { CSSProperties } from "react";

import { designTokenVar } from "@/shared/designSystem";

interface FooterProps {
  themeColor?: string;
}

const FOOTER_BACKGROUND = designTokenVar(
  "component.footer.background",
  "#0B6D53"
);
const FOOTER_TEXT = designTokenVar("component.footer.textColor", "#FFFFFF");
const FOOTER_DIVIDER = designTokenVar(
  "component.footer.dividerColor",
  "#D9E2DD"
);
const FOOTER_PADDING_X = designTokenVar("component.footer.paddingX", "16px");
const FOOTER_PADDING_Y = designTokenVar("component.footer.paddingY", "12px");

const Footer = ({ themeColor }: FooterProps) => (
  <footer
    role="contentinfo"
    className="border-t"
    style={
      {
        "--footer-background": themeColor ?? FOOTER_BACKGROUND,
        "--footer-text": FOOTER_TEXT,
        "--footer-divider": FOOTER_DIVIDER,
        "--footer-padding-x": FOOTER_PADDING_X,
        "--footer-padding-y": FOOTER_PADDING_Y,
        backgroundColor: "var(--footer-background)",
        color: "var(--footer-text)",
        borderColor: "var(--footer-divider)",
      } as CSSProperties & Record<`--${string}`, string>
    }
  >
    <div className="px-[var(--footer-padding-x)] py-[var(--footer-padding-y)] text-center">
      <p className="text-center text-base font-medium leading-6">
        © 2026 Virtual Tech Japan Inc.
      </p>
    </div>
  </footer>
);

export default Footer;
