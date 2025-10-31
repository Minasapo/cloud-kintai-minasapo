// cspell: ignore testid
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { Box, IconButton, Stack, TextField } from "@mui/material";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Attendance } from "../../API";

export interface TimeRecorderRemarksProps {
  attendance: Attendance | undefined | null;
  onSave: (remarks: Attendance["remarks"]) => void;
}

/**
 * @deprecated このコンポーネントは非推奨です。
 * 可能であれば代替の Remarks コンポーネントまたは新しい実装へ移行してください。
 * - 理由: UI/仕様の変更により置き換え予定です。
 *
 * 開発環境ではコンソールに警告が表示されます。
 */
export default function TimeRecorderRemarks({
  attendance,
  onSave,
}: TimeRecorderRemarksProps) {
  // 非推奨マークは JSDoc の @deprecated のみで表現します（ランタイムの警告は表示しません）
  const [formState, setFormState] = useState<Attendance["remarks"]>(
    attendance?.remarks
  );

  useEffect(() => {
    setFormState(attendance?.remarks);
  }, [attendance]);

  const isChanged = useMemo(
    () => attendance?.remarks !== formState,
    [attendance?.remarks, formState]
  );

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setFormState(event.target.value);
  }, []);

  const handleSave = useCallback(() => {
    onSave(formState);
  }, [formState, onSave]);

  const handleClear = useCallback(() => {
    setFormState(attendance?.remarks);
  }, [attendance?.remarks]);

  const textFieldValue = formState ?? "";

  return (
    <Stack>
      <Box>
        <TextField
          data-testid="remarks-text"
          multiline
          minRows={2}
          fullWidth
          value={textFieldValue}
          placeholder="労務担当より指示された時のみ(例：客先名やイベント名など)"
          onChange={handleChange}
        />
      </Box>
      <Box>
        {isChanged && (
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={0}
          >
            <Box>
              <IconButton onClick={handleSave}>
                <CheckIcon color="success" data-testid="remarksSave" />
              </IconButton>
            </Box>
            <Box>
              <IconButton onClick={handleClear}>
                <ClearIcon color="error" data-testid="remarksClear" />
              </IconButton>
            </Box>
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
