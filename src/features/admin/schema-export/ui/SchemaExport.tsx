import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useContext, useMemo, useState } from "react";

import { AuthContext } from "@/context/AuthContext";

import { downloadJsonFile } from "../model/downloadJsonFile";
import {
  EXPORT_MODEL_DEFINITIONS,
  getExportModelDefinition,
} from "../model/exportRegistry";
import {
  type BulkExportProgress,
  createBulkExportArtifact,
  createSingleExportArtifact,
} from "../model/exportService";

type ExportMode = "all" | "single" | null;

export default function SchemaExport() {
  const { cognitoUser } = useContext(AuthContext);
  const modelOptions = useMemo(() => EXPORT_MODEL_DEFINITIONS, []);
  const [selectedModel, setSelectedModel] = useState(
    modelOptions[0]?.modelName ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<ExportMode>(null);
  const [bulkExportProgress, setBulkExportProgress] =
    useState<BulkExportProgress | null>(null);
  const canUseExport = Boolean(cognitoUser?.owner);

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    setSelectedModel(event.target.value);
  };

  const handleSingleExport = async () => {
    const definition = getExportModelDefinition(selectedModel);
    if (!definition || activeMode) return;

    setError(null);
    setActiveMode("single");

    try {
      const artifact = await createSingleExportArtifact(definition);
      downloadJsonFile(artifact.payload, artifact.fileName);
    } catch (exportError) {
      const message =
        exportError instanceof Error
          ? exportError.message
          : "個別エクスポートに失敗しました。";
      setError(message);
    } finally {
      setActiveMode(null);
    }
  };

  const handleBulkExport = async () => {
    if (activeMode) return;

    setError(null);
    setActiveMode("all");
    setBulkExportProgress(null);

    try {
      const artifact = await createBulkExportArtifact(
        undefined,
        undefined,
        setBulkExportProgress
      );
      downloadJsonFile(artifact.payload, artifact.fileName);
    } catch (exportError) {
      const message =
        exportError instanceof Error
          ? exportError.message
          : "一括エクスポートに失敗しました。";
      setError(message);
    } finally {
      setActiveMode(null);
      setBulkExportProgress(null);
    }
  };

  const isExporting = activeMode !== null;
  const bulkProgressValue =
    bulkExportProgress && bulkExportProgress.totalModels > 0
      ? (bulkExportProgress.completedModels / bulkExportProgress.totalModels) * 100
      : 0;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        データエクスポート
      </Typography>
      <Stack spacing={3}>
        <Typography variant="body2" color="text.secondary">
          システム内の設定や登録データを、まとめて JSON ファイルとして保存できる保守機能です。
        </Typography>

        {!canUseExport && (
          <Alert severity="warning">
            この機能はオーナー権限ユーザーのみ利用できます。
          </Alert>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {canUseExport && (
          <>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h6">個別エクスポート</Typography>
                <FormControl fullWidth>
                  <InputLabel id="schema-export-model-label">対象モデル</InputLabel>
                  <Select
                    labelId="schema-export-model-label"
                    value={selectedModel}
                    label="対象モデル"
                    onChange={handleModelChange}
                    disabled={isExporting}
                  >
                    {modelOptions.map((option) => (
                      <MenuItem key={option.modelName} value={option.modelName}>
                        {option.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    onClick={handleSingleExport}
                    disabled={!selectedModel || isExporting}
                  >
                    個別エクスポート
                  </Button>
                  {activeMode === "single" && <CircularProgress size={20} />}
                </Stack>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6">一括エクスポート</Typography>
                <Typography variant="body2" color="text.secondary">
                  対象 {modelOptions.length} モデルを全件取得し、単一 JSON ファイルとしてダウンロードします。
                </Typography>
                <Alert severity="warning">
                  全モデルの一括エクスポート実行中は、画面を移動せずそのままお待ちください。
                </Alert>
                {activeMode === "all" && bulkExportProgress && (
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      {bulkExportProgress.totalModels} モデル中{" "}
                      {bulkExportProgress.completedModels + 1} 件目を処理中:{" "}
                      {bulkExportProgress.currentModelName}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={bulkProgressValue}
                      aria-label="一括エクスポート進捗"
                    />
                  </Stack>
                )}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    onClick={handleBulkExport}
                    disabled={isExporting}
                  >
                    全モデルを一括エクスポート
                  </Button>
                  {activeMode === "all" && <CircularProgress size={20} />}
                </Stack>
              </Stack>
            </Paper>
          </>
        )}
      </Stack>
    </Box>
  );
}
