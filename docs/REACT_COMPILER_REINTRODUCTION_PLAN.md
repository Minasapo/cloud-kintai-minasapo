# React Compiler 再導入計画

## 背景

- 現在は `vite.config.ts` で React Compiler が無効化されている。
- 既存コードには React Compiler 互換性の観点で見直しが必要な箇所が残っている。
- 一括で有効化すると、表示不整合やパフォーマンス退行の切り分けが困難になる。

## 方針

- `VITE_ENABLE_REACT_COMPILER=true` のときのみ React Compiler を有効化する。
- デフォルトは無効のまま維持し、段階的に検証対象を広げる。
- `compilationMode: "annotation"` を採用し、対象範囲を明示的に制御する。

## 実施ステップ

1. 基盤整備
- Vite 設定に環境フラグを追加する。
- ローカルで `VITE_ENABLE_REACT_COMPILER=true npm run typecheck` と `npm run lint` を通す。

2. 互換性調査
- 既存の hooks 依存配列、可変参照の扱い、暗黙的副作用の箇所を棚卸しする。
- React Compiler 非互換になりやすい処理を小さな単位で分割する。

3. 限定導入
- 影響範囲の狭い画面・機能から annotation を付与して有効化する。
- 画面ごとに差分検証（レンダリング回数、操作遅延、エラー発生率）を実施する。

4. 段階展開
- 問題がない対象から順次 annotation 適用範囲を拡大する。
- 退行が出た機能は annotation を戻して個別に再調査する。

5. 本格運用判断
- 主要フロー（打刻、勤怠一覧、申請承認）で回帰がないことを確認する。
- デフォルト有効化の可否を別 Issue で最終判断する。

## 受け入れ条件

- 環境フラグで React Compiler の ON/OFF を切り替えられる。
- ON/OFF のどちらでも `npm run lint` と `npm run typecheck` が成功する。
- 段階導入の実施順と検証観点が明文化されている。
