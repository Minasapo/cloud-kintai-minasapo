import { ErrorMessage } from "@shared/ui/feedback/ErrorMessage";
import { LoadingSpinner } from "@shared/ui/feedback/LoadingSpinner";

import { useAttendanceEditorState } from "./model/useAttendanceEditorState";
import { AttendanceEditorContainer } from "./ui/AttendanceEditorContainer";

/**
 * AttendanceEditor component.
 */
export function AttendanceEditor({ readOnly }: { readOnly?: boolean }) {
  const state = useAttendanceEditorState({ readOnly });

  if (state.appConfigLoading || state.staffsLoading) {
    return <LoadingSpinner />;
  }

  if (state.staffSError) {
    return <ErrorMessage message={state.staffSError.message} />;
  }

  if (!state.hasAttendanceFetched && !state.isSubmitting) {
    return <LoadingSpinner />;
  }

  return (
    <AttendanceEditorContainer
      {...state}
    />
  );
}