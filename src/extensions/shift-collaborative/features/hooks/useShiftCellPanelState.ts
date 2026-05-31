import { useEffect, useState } from "react";

import { Mention } from "../types/collaborative.types";

interface UseShiftCellPanelStateParams {
  cellHistoryLength: number;
  onAddComments?: (content: string, mentions: Mention[]) => Promise<void>;
}

export const useShiftCellPanelState = ({
  cellHistoryLength,
  onAddComments,
}: UseShiftCellPanelStateParams) => {
  const [commentText, setCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  useEffect(() => {
    if (cellHistoryLength > 0) {
      setHistoryExpanded(true);
    }
  }, [cellHistoryLength]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !onAddComments) return;

    setIsAddingComment(true);
    try {
      await onAddComments(commentText, []);
      setCommentText("");
    } finally {
      setIsAddingComment(false);
    }
  };

  return {
    commentText,
    isAddingComment,
    historyExpanded,
    setCommentText,
    setHistoryExpanded,
    handleAddComment,
  };
};
