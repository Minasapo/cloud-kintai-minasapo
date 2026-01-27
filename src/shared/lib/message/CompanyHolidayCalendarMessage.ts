import { Message } from "./Message";

export class CompanyHolidayCalendarMessage extends Message {
  private categoryName: string = "会社休日カレンダー";

  constructor() {
    super();
  }

  getCategoryName(): string {
    return this.categoryName;
  }
}
