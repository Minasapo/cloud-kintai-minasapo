// Playwright全テスト共通のconsoleログ取得fixture
import { test as base } from "@playwright/test";
import fs from "fs";
import path from "path";

export const test = base.extend({
  loggedPage: async ({ page }, use, testInfo) => {
    // logsディレクトリ作成
    const logsDir = path.resolve(process.cwd(), "playwright-logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }
    // テストごとにファイル名を分ける
    const logFile = path.join(
      logsDir,
      `${testInfo.title.replace(/[^a-zA-Z0-9-_]/g, "_")}.log`
    );
    const logStream = fs.createWriteStream(logFile, { flags: "a" });
    page.on("console", (msg) => {
      logStream.write(`[${msg.type()}] ${msg.text()}\n`);
    });
    await use(page);
    if (testInfo.status !== testInfo.expectedStatus) {
      logStream.write(
        `\n[TEST FAILED] ${testInfo.error?.message || "Unknown error"}\n`
      );
      if (testInfo.error?.stack) {
        logStream.write(`${testInfo.error.stack}\n`);
      }
    }
    logStream.end();
  },
});
