このプロジェクトでコード生成するために必要な情報をエージェント向けに提供するためのドキュメントです。

## ルール

英語で考えて、日本語で出力してください。

## 実装

実装時は、適宜LinterやFormatterを使用してコードの品質を保ってください。
コードを変更した際に作業コメントは不要です。(例：xxxを削減。xxxを修正、xxxを削除など)

## テスト

以下のコマンドを実行して、すべてのユニットテストとE2Eテストがパスすることを確認してください。

```bash
npm run test:unit
npm run test:e2e -- smoke-test --project=chromium-staff
npm run test:e2e -- smoke-test --project=chromium-admin
npm run test:e2e -- visual-regression --project=chromium-staff
npm run test:e2e -- visual-regression --project=chromium-admin
```

## コミットメッセージ

コミットメッセージは英語で記述してください。
例: "Add Storybook stories for HeaderBar component"
