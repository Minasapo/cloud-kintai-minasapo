import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

import { designTokenVar } from "@/shared/designSystem";

const PAGE_PADDING_TOP = designTokenVar("component.page.paddingTop", "24px");
const PAGE_SECTION_GAP = designTokenVar("component.page.sectionGap", "16px");

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div
      className="mx-auto min-h-[60vh] w-full max-w-screen-xl px-4 pt-6"
      style={
        {
          paddingTop: PAGE_PADDING_TOP,
          "--page-section-gap": PAGE_SECTION_GAP,
        } as CSSProperties & Record<`--${string}`, string>
      }
    >
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-[var(--page-section-gap)]">
        <div className="py-4 text-center">
          <div className="mb-2 text-[72px] font-bold leading-none text-primary md:text-[120px]">
            404
          </div>

          <h1 className="mb-1 text-2xl font-semibold text-foreground md:text-[32px]">
            ページが見つかりません
          </h1>

          <p className="mb-4 max-w-[500px] text-sm leading-7 text-[var(--ds-color-neutral-600,#5E726A)] md:text-base">
            お探しのページは存在しないか、移動された可能性があります。
            <br />
            ホームページに戻るか、前のページに戻ってください。
          </p>

          <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={handleGoHome}
              className="min-w-40 rounded-md bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:brightness-95"
            >
              ホームに戻る
            </button>
            <button
              type="button"
              onClick={handleGoBack}
              className="min-w-40 rounded-md border border-primary bg-transparent px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              前のページに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
