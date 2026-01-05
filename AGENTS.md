このプロジェクトでコード生成するために必要な情報をエージェント向けに提供するためのドキュメントです。

## ルール

英語で考えて、日本語で出力してください。

## テスト

以下のコマンドを実行して、すべてのユニットテストとE2Eテストがパスすることを確認してください。

```bash
npm run test:unit
npm run test:e2e -- smoke-test --project=chromium-staff
npm run test:e2e -- smoke-test --project=chromium-admin
```
