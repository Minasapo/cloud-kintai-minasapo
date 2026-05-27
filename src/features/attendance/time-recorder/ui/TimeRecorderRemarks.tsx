import type { Attendance } from "@shared/api/graphql/types";
import TimeRecorderRemarksView from "@shared/ui/time-recorder/TimeRecorderRemarks";
import { useCallback, useMemo, useState } from "react";

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
  const attendanceKey = `${attendance?.id ?? ""}:${attendance?.workDate ?? ""}`;
  const [draft, setDraft] = useState<{
    key: string;
    value: Attendance["remarks"];
  } | null>(null);

  const formState = useMemo(() => {
    if (draft?.key === attendanceKey) {
      return draft.value;
    }

    return attendance?.remarks;
  }, [attendance?.remarks, attendanceKey, draft]);

  const isChanged = useMemo(
    () => attendance?.remarks !== formState,
    [attendance?.remarks, formState],
  );

  const handleChange = useCallback(
    (value: string) => {
      setDraft({
        key: attendanceKey,
        value,
      });
    },
    [attendanceKey],
  );

  const handleSave = useCallback(() => {
    onSave(formState);
  }, [formState, onSave]);

  const handleClear = useCallback(() => {
    setDraft({
      key: attendanceKey,
      value: attendance?.remarks,
    });
  }, [attendance?.remarks, attendanceKey]);

  const textFieldValue = formState ?? "";

  return (
    <TimeRecorderRemarksView
      value={textFieldValue}
      placeholder="労務担当より指示された時のみ(例：客先名やイベント名など)"
      isChanged={isChanged}
      onChange={handleChange}
      onSave={handleSave}
      onClear={handleClear}
    />
  );
}
