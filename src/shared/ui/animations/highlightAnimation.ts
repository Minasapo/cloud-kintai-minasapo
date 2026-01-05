import { keyframes } from "@mui/material";

/**
 * フラグON時に連動して値が設定される項目をハイライトするアニメーション
 * より視覚的に分かりやすくするため、背景色、ボーダー、ボックスシャドウを組み合わせる
 */
export const highlightAnimation = keyframes`
  0% {
    backgroundColor: transparent;
    borderColor: transparent;
    boxShadow: none;
    transform: scale(1);
  }
  15% {
    backgroundColor: #FFE082;
    borderColor: #FFC107;
    boxShadow: 0 0 12px rgba(255, 193, 7, 0.6);
    transform: scale(1.02);
  }
  50% {
    backgroundColor: #FFE082;
    borderColor: #FFC107;
    boxShadow: 0 0 12px rgba(255, 193, 7, 0.6);
    transform: scale(1.02);
  }
  85% {
    backgroundColor: #FFF9C4;
    borderColor: #FFC107;
    boxShadow: 0 0 8px rgba(255, 193, 7, 0.4);
    transform: scale(1.01);
  }
  100% {
    backgroundColor: transparent;
    borderColor: transparent;
    boxShadow: none;
    transform: scale(1);
  }
`;

/**
 * パルス効果で2回点滅するアニメーション
 */
export const pulseAnimation = keyframes`
  0%, 100% {
    backgroundColor: transparent;
    boxShadow: none;
  }
  20%, 60% {
    backgroundColor: #FFE082;
    boxShadow: 0 0 15px rgba(255, 193, 7, 0.7);
  }
  40%, 80% {
    backgroundColor: #FFF9C4;
    boxShadow: 0 0 8px rgba(255, 193, 7, 0.4);
  }
`;

/**
 * ハイライトアニメーションのスタイルオプション
 */
export const highlightAnimationStyles = {
  animation: `${highlightAnimation} 2.5s ease-in-out`,
  border: "2px solid transparent",
  transition: "all 0.2s ease-in-out",
};

/**
 * パルスアニメーションのスタイルオプション（より目立つ効果）
 */
export const pulseAnimationStyles = {
  animation: `${pulseAnimation} 2s ease-in-out`,
  borderRadius: "4px",
  transition: "all 0.2s ease-in-out",
};
