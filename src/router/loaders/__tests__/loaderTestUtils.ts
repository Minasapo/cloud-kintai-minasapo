import type { LoaderFunctionArgs } from "react-router-dom";

/**
 * LoaderFunctionArgs の部分的なテストヘルパー
 * テストで必要な最小限のプロパティを提供します
 */
export function createLoaderArgs(
  overrides?: Partial<LoaderFunctionArgs>
): LoaderFunctionArgs {
  return {
    params: { id: "wf-1" },
    request:
      typeof Request !== "undefined"
        ? new Request("http://localhost")
        : new (class SimpleRequest {
            url: string;
            constructor(url: string) {
              this.url = url;
            }
          })("http://localhost"),
    // LoaderFunctionArgsの必須プロパティは以下です
    // これらは実行時に react-router-dom により自動的に設定されるため、
    // テストではダミー値を提供します
    ...overrides,
  } as LoaderFunctionArgs;
}
