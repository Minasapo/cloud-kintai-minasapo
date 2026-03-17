import type { CSSProperties } from "react";

import LogoImage from "@/images/logo.png";
import { designTokenVar } from "@/shared/designSystem";
import Link from "@/shared/ui/link/Link";

const HEADER_LOGO_MAX_HEIGHT = designTokenVar(
  "component.headerBar.logoMaxHeight",
  "32px",
);

const Logo = () => (
  <div
    className="flex flex-grow-0 items-center justify-center overflow-hidden h-[26px] max-w-[clamp(64px,30vw,180px)] sm:h-[28px] sm:max-w-[220px] md:h-[var(--header-logo-max-height)] md:max-w-none"
    style={
      {
        "--header-logo-max-height": HEADER_LOGO_MAX_HEIGHT,
      } as CSSProperties
    }
  >
    <Link
      href="/"
      variant="inherit"
      color="inherit"
      underline="none"
      className="inline-flex h-[26px] max-w-full items-center bg-transparent sm:h-[28px] md:h-[var(--header-logo-max-height)]"
    >
      <img
        src={LogoImage}
        alt="クラウド勤怠のロゴ"
        style={{
          height: "100%",
          maxHeight: "100%",
          maxWidth: "100%",
          width: "auto",
          display: "block",
          objectFit: "contain",
        }}
      />
    </Link>
  </div>
);

export default Logo;
