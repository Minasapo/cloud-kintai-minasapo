このプロジェクトでコード生成するために必要な情報をエージェント向けに提供するためのドキュメントです。

## ルール

英語で考えて、日本語で出力してください。

## React 18.3.1 への更新 (2025-12-12)

- `react`, `react-dom`, `@types/react`, `@types/react-dom` を 18.3.1 系へ引き上げ済み。
- `react-native` 系のピア依存が自動インストールされ、`react@18.3.1` と `react-native@0.73.x` の組み合わせで `react 18.2.0` を要求する警告が出る。現状は Amplify/Redux が内部で RN パッケージをピア依存として宣言しているためで、実害はなくビルド/テストは成功。必要に応じて `overrides` や `npm install --legacy-peer-deps` で抑制可能。
- 実行ログ:
	- `npm run test:unit`
	- `npm run build`
- 主要画面の手動スモークテストは未実施（対応者にてブラウザで `/`, `/attendance`, `/admin` 等を確認してください）。
