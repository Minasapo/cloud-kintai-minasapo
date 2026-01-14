# Playwright テスト仕様

- E2E テスト仕様書・シナリオ定義は本ディレクトリ配下に配置します。例: `tests/attendance/flow.instructions.md`。
- 実装済みテストは `tests/<route>/*.spec.ts` にまとめ、仕様と同じサブフォルダ構成を維持します。
- 仕様更新時は `docs/` ではなくこちらを更新し、PR ではテストコードと同じセットでレビューできるようにします。
## ビジュアルリグレッションテスト

ビジュアルリグレッションテストは[VISUAL_REGRESSION_OPTIMIZATION.md](./VISUAL_REGRESSION_OPTIMIZATION.md)に記載の最適化が実施されており、以下の特徴があります：

- **テスト数削減**: 重複するファーストビューテストを削除し、約44%のテスト数削減
- **実行時間短縮**: 不要なログイン処理と待機時間の削減により、約65%の時間短縮
- **並列実行**: CI環境でも並列実行を有効化

詳細は以下のドキュメントを参照してください：
- [VISUAL_REGRESSION_OPTIMIZATION.md](./VISUAL_REGRESSION_OPTIMIZATION.md) - パフォーマンス最適化の詳細
- [VISUAL_REGRESSION_GUIDE.md](./VISUAL_REGRESSION_GUIDE.md) - 基本的な使用方法
- [VISUAL_REGRESSION_QUICKSTART.md](./VISUAL_REGRESSION_QUICKSTART.md) - クイックスタートガイド
