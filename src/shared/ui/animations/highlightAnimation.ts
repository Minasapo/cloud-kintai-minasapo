const HIGHLIGHT_ANIMATION_NAME = "attendance-highlight-animation";
const PULSE_ANIMATION_NAME = "attendance-pulse-animation";

/**
 * フラグON時に連動して値が設定される項目をハイライトするアニメーション
 * より視覚的に分かりやすくするため、背景色、ボーダー、ボックスシャドウを組み合わせる
 */
export const highlightAnimation = HIGHLIGHT_ANIMATION_NAME;

/**
 * パルス効果で2回点滅するアニメーション
 */
export const pulseAnimation = PULSE_ANIMATION_NAME;

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

export const highlightAnimationKeyframes = `
@keyframes ${HIGHLIGHT_ANIMATION_NAME} {
  0% {
    background-color: transparent;
    border-color: transparent;
    box-shadow: none;
    transform: scale(1);
  }
  15% {
    background-color: #FFE082;
    border-color: #FFC107;
    box-shadow: 0 0 12px rgba(255, 193, 7, 0.6);
    transform: scale(1.02);
  }
  50% {
    background-color: #FFE082;
    border-color: #FFC107;
    box-shadow: 0 0 12px rgba(255, 193, 7, 0.6);
    transform: scale(1.02);
  }
  85% {
    background-color: #FFF9C4;
    border-color: #FFC107;
    box-shadow: 0 0 8px rgba(255, 193, 7, 0.4);
    transform: scale(1.01);
  }
  100% {
    background-color: transparent;
    border-color: transparent;
    box-shadow: none;
    transform: scale(1);
  }
}
`;

export const pulseAnimationKeyframes = `
@keyframes ${PULSE_ANIMATION_NAME} {
  0%, 100% {
    background-color: transparent;
    box-shadow: none;
  }
  20%, 60% {
    background-color: #FFE082;
    box-shadow: 0 0 15px rgba(255, 193, 7, 0.7);
  }
  40%, 80% {
    background-color: #FFF9C4;
    box-shadow: 0 0 8px rgba(255, 193, 7, 0.4);
  }
}
`;
