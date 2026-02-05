# entities 層

ドメインごとの型・API クライアント・ビジネスロジックを配置します。`attendance`, `shift`, `user` などのサブフォルダ配下に `model/`, `api/`, `lib/` を揃えることを推奨します。
例として `entities/attendance` は 勤怠データの型定義 検証ロジック API 呼び出しを担います。
