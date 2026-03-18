import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SchemaExport from "./SchemaExport";

const mockCreateSingleExportArtifact = jest.fn();
const mockCreateBulkExportArtifact = jest.fn();
const mockDownloadJsonFile = jest.fn();

jest.mock("../model/exportService", () => ({
  createSingleExportArtifact: (...args: unknown[]) =>
    mockCreateSingleExportArtifact(...args),
  createBulkExportArtifact: (...args: unknown[]) =>
    mockCreateBulkExportArtifact(...args),
}));

jest.mock("../model/downloadJsonFile", () => ({
  downloadJsonFile: (...args: unknown[]) => mockDownloadJsonFile(...args),
}));

describe("SchemaExport", () => {
  beforeEach(() => {
    mockCreateSingleExportArtifact.mockReset();
    mockCreateBulkExportArtifact.mockReset();
    mockDownloadJsonFile.mockReset();
  });

  it("renders export actions and model options", () => {
    render(<SchemaExport />);

    expect(screen.getByText("データエクスポート")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "個別エクスポート" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "全モデルを一括エクスポート" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("対象モデル")).toBeInTheDocument();
    expect(
      screen.getByText(
        "全モデルの一括エクスポート実行中は、画面を移動せずそのままお待ちください。"
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("対象モデル一覧")).not.toBeInTheDocument();
  });

  it("exports a selected model", async () => {
    const user = userEvent.setup();
    mockCreateSingleExportArtifact.mockResolvedValue({
      fileName: "single.json",
      payload: { model: "Staff", count: 1, exportedAt: "x", items: [] },
    });

    render(<SchemaExport />);

    await user.click(screen.getByRole("button", { name: "個別エクスポート" }));

    await waitFor(() => {
      expect(mockCreateSingleExportArtifact).toHaveBeenCalled();
      expect(mockDownloadJsonFile).toHaveBeenCalledWith(
        { model: "Staff", count: 1, exportedAt: "x", items: [] },
        "single.json"
      );
    });
  });

  it("disables actions while bulk export is running", async () => {
    const user = userEvent.setup();
    let resolvePromise: ((value: unknown) => void) | undefined;
    mockCreateBulkExportArtifact.mockImplementation(
      (_definitions, _date, onProgress) =>
        new Promise((resolve) => {
          onProgress?.({
            completedModels: 0,
            currentModelName: "AppConfig",
            totalModels: 17,
          });
          resolvePromise = resolve;
        })
    );

    render(<SchemaExport />);

    await user.click(
      screen.getByRole("button", { name: "全モデルを一括エクスポート" })
    );

    expect(
      screen.getByRole("button", { name: "全モデルを一括エクスポート" })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "個別エクスポート" })).toBeDisabled();
    expect(
      screen.getByText("17 モデル中 1 件目を処理中: AppConfig")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "一括エクスポート進捗" })
    ).toBeInTheDocument();

    resolvePromise?.({
      fileName: "bulk.json",
      payload: { exportedAt: "x", modelCounts: {}, models: {} },
    });

    await waitFor(() => {
      expect(mockDownloadJsonFile).toHaveBeenCalledWith(
        { exportedAt: "x", modelCounts: {}, models: {} },
        "bulk.json"
      );
    });
  });

  it("shows an error when export fails", async () => {
    const user = userEvent.setup();
    mockCreateSingleExportArtifact.mockRejectedValue(
      new Error("Staff の取得に失敗しました。")
    );

    render(<SchemaExport />);

    await user.click(screen.getByRole("button", { name: "個別エクスポート" }));

    expect(
      await screen.findByText("Staff の取得に失敗しました。")
    ).toBeInTheDocument();
  });
});
