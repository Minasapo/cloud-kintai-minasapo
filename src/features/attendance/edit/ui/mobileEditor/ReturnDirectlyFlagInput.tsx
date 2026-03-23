import SharedReturnDirectlyFlagInput from "../ReturnDirectlyFlagInput";

export function ReturnDirectlyFlagInput() {
  return (
    <SharedReturnDirectlyFlagInput
      inputVariant="switch"
      layout="inline"
      successMessage="勤務終了時間が自動設定されました"
    />
  );
}
