import { createLogger } from "@shared/lib/logger";
import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { ErrorFallbackPanel } from "./ErrorFallbackPanel";

const logger = createLogger("FeatureErrorBoundary");

type FeatureErrorBoundaryProps = {
  children: ReactNode;
  title?: string;
};

type FeatureErrorBoundaryState = {
  error: Error | null;
};

export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  override state: FeatureErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("Feature rendering failed", error, info.componentStack);
  }

  override render() {
    const { children, title = "画面の一部で問題が発生しました" } = this.props;
    const { error } = this.state;

    if (!error) {
      return children;
    }

    return (
      <ErrorFallbackPanel
        title={title}
        message={error.message || "予期しないエラーが発生しました。"}
      />
    );
  }
}
