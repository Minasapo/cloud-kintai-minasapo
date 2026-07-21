import { useState } from "react";

import { Mention } from "../types/collaborative.types";

interface UseShiftCellPanelStateParams {
  onAddComments?: (content: string, mentions: Mention[]) => Promise<void>;
}

export const useShiftCellPanelState = ({
  onAddComments,
}: UseShiftCellPanelStateParams) => {
  const [commentText, setCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

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
    setCommentText,
    handleAddComment,
  };
};
