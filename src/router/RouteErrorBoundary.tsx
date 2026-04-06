import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import NotFound from "@/pages/NotFound";
import { designTokenVar } from "@/shared/designSystem";

const PAGE_PADDING_TOP = designTokenVar("component.page.paddingTop", "24px");
const PAGE_SECTION_GAP = designTokenVar("component.page.sectionGap", "16px");

export default function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  return (
    <div
      className="mx-auto min-h-[40vh] w-full max-w-5xl px-4 pt-6 sm:px-6"
      style={{ paddingTop: PAGE_PADDING_TOP }}
    >
      <div className="flex flex-col" style={{ gap: PAGE_SECTION_GAP }}>
        <h1 className="m-0 text-3xl font-bold tracking-[-0.03em] text-slate-950">
          ページの表示中に問題が発生しました
        </h1>
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900"
        >
          {isRouteErrorResponse(error)
            ? error.data || `${error.status} ${error.statusText}`
            : error instanceof Error
              ? error.message
              : "予期しないエラーが発生しました。"}
        </div>
      </div>
    </div>
  );
}
