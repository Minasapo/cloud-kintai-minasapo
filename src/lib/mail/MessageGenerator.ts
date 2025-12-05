export class MessageGenerator {
  familyName?: string;
  givenName?: string;

  constructor() {}

  setStaffName(familyName: string, givenName: string) {
    this.familyName = familyName;
    this.givenName = givenName;
  }

  generate() {
    return "";
  }
}
