このプロジェクトでコード生成するために必要な情報をエージェント向けに提供するためのドキュメントです。

## ルール

英語で考えて、日本語で出力してください。

## 実装

実装時は、適宜 Linter や Formatter を使用してコードの品質を保ってください。
コードを変更した際に作業コメントは不要です。(例：xxx を削減。xxx を修正、xxx を削除など)

## テスト

以下のコマンドを実行して、すべてのユニットテストと E2E テストがパスすることを確認してください。

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

## 用語

### 勤怠(Attendance)

勤怠とは、スタッフの勤務時間や出勤・退勤、休憩時間などの記録を指します。勤怠管理は、労働時間の適正な把握や給与計算、法令遵守のために重要です。

### 打刻エラー

打刻エラーとは、勤怠システムにおいて、スタッフが勤務開始/終了や休憩開始/終了などを忘れた場合などに発生するエラーのことを指します。これにより、正確な勤務時間の記録ができなくなり、給与計算や勤務管理に影響を及ぼす可能性があります。

打刻エラーは、スタッフにより勤怠編集画面から打刻の修正申請が行われ、管理者がその申請を承認することで解決されます。または、管理者側で直接修正することも可能です。
