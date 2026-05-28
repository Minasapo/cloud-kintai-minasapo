import NotFound from "@pages/NotFound";
import { designTokenVar } from "@shared/designSystem";
import { ErrorFallbackPanel } from "@shared/ui/feedback";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

const PAGE_PADDING_TOP = designTokenVar("component.page.paddingTop", "24px");

export default function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  return (
    <div style={{ paddingTop: PAGE_PADDING_TOP }}>
      <ErrorFallbackPanel
        scope="page"
        title="ページの表示中に問題が発生しました"
        message={
          isRouteErrorResponse(error)
            ? String(error.data || `${error.status} ${error.statusText}`)
            : error instanceof Error
              ? error.message
              : "予期しないエラーが発生しました。"
        }
      />
    </div>
  );
}
