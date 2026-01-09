import type { Attendance } from "@shared/api/graphql/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import TimeRecorderRemarksView from "@/shared/ui/time-recorder/TimeRecorderRemarks";

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

  // attendance が変更された場合のみフォーム状態を更新（外部データとの同期）
  const attendanceRemarks = attendance?.remarks;
  useEffect(() => {
    // 外部データの変更を検知してフォーム状態を更新
    if (attendanceRemarks !== undefined) {
      setFormState(attendanceRemarks);
    }
  }, [attendanceRemarks]);

  const isChanged = useMemo(
    () => attendance?.remarks !== formState,
    [attendance?.remarks, formState]
  );

  const handleChange = useCallback((value: string) => {
    setFormState(value);
  }, []);

  const handleSave = useCallback(() => {
    onSave(formState);
  }, [formState, onSave]);

  const handleClear = useCallback(() => {
    setFormState(attendance?.remarks);
  }, [attendance?.remarks]);

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
