import { CompanyHolidayCalenderMessage } from "../CompanyHolidayCalenderMessage";
import { HolidayCalenderMessage } from "../HolidayCalenderMessage";
import { Message, MessageStatus } from "../Message";

describe("Message base class", () => {
  class TestMessage extends Message {
    getCategoryName(): string {
      return "テストカテゴリ";
    }
  }

  it("generates success messages for CRUD operations", () => {
    const msg = new TestMessage();

    expect(msg.create(MessageStatus.SUCCESS)).toBe(
      "テストカテゴリを作成しました"
    );
    expect(msg.update(MessageStatus.SUCCESS)).toBe(
      "テストカテゴリを更新しました"
    );
    expect(msg.delete(MessageStatus.SUCCESS)).toBe(
      "テストカテゴリを削除しました"
    );
    expect(msg.get(MessageStatus.SUCCESS)).toBe("テストカテゴリを作成しました");
  });

  it("generates error messages with code", () => {
    const msg = new TestMessage();

    expect(msg.create(MessageStatus.ERROR)).toContain(
      "テストカテゴリの作成に失敗しました"
    );
    expect(msg.create(MessageStatus.ERROR)).toMatch(/\(E\d{2}\d{3}\)/);
  });
});

describe("HolidayCalenderMessage", () => {
  it("uses '休日カレンダー' as category name", () => {
    const msg = new HolidayCalenderMessage();

    expect(msg.create(MessageStatus.SUCCESS)).toBe(
      "休日カレンダーを作成しました"
    );
  });
});

describe("CompanyHolidayCalenderMessage", () => {
  it("uses '会社休日カレンダー' as category name", () => {
    const msg = new CompanyHolidayCalenderMessage();

    expect(msg.update(MessageStatus.SUCCESS)).toBe(
      "会社休日カレンダーを更新しました"
    );
  });
});
