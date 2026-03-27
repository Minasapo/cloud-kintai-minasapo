import type { CSSProperties } from "react";

import LogoImage from "@/images/logo.png";
import { designTokenVar } from "@/shared/designSystem";
import Link from "@/shared/ui/link/Link";

const HEADER_LOGO_MAX_HEIGHT = designTokenVar(
  "component.headerBar.logoMaxHeight",
  "32px",
);
const HEADER_LOGO_MAX_WIDTH = designTokenVar(
  "component.headerBar.logoMaxWidth",
  "220px",
);
const HEADER_LOGO_ASPECT_RATIO = designTokenVar(
  "component.headerBar.logoAspectRatio",
  "11 / 2",
);

const Logo = () => (
  <div
    className="flex h-[26px] w-[min(100%,180px)] flex-grow-0 items-center justify-center overflow-hidden sm:h-[28px] sm:w-[min(100%,var(--header-logo-max-width))] md:h-[var(--header-logo-max-height)]"
    style={
      {
        "--header-logo-max-height": HEADER_LOGO_MAX_HEIGHT,
        "--header-logo-max-width": HEADER_LOGO_MAX_WIDTH,
        "--header-logo-aspect-ratio": HEADER_LOGO_ASPECT_RATIO,
        aspectRatio: "var(--header-logo-aspect-ratio)",
      } as CSSProperties
    }
  >
    <Link
      href="/"
      className="inline-flex h-full w-full max-w-full items-center bg-transparent"
    >
      <img
        src={LogoImage}
        alt="クラウド勤怠のロゴ"
        style={{
          height: "100%",
          width: "100%",
          display: "block",
          objectFit: "contain",
        }}
      />
    </Link>
  </div>
);

export default Logo;
