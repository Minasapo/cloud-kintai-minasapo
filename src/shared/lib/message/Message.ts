export enum MessageStatus {
  ERROR = "E",
  SUCCESS = "S",
}

export enum MessageCategory {
  HolidayCalendar = "8",
}

export enum OperationCode {
  Get = "1",
  Create = "2",
  Update = "3",
  Delete = "4",
}

export type MessageGenerator = {
  getCategoryName: () => string;
  get: (status: MessageStatus) => string;
  create: (status: MessageStatus) => string;
  update: (status: MessageStatus) => string;
  delete: (status: MessageStatus) => string;
};

type MessageFactoryOptions = {
  messageCode?: MessageCategory | string;
};

const getOperationName = (operation: OperationCode) => {
  switch (operation) {
    case OperationCode.Get:
      return "取得";
    case OperationCode.Create:
      return "作成";
    case OperationCode.Update:
      return "更新";
    case OperationCode.Delete:
      return "削除";
    default:
      throw new Error("Invalid operation code");
  }
};

const getMessageCode = (
  status: MessageStatus,
  operation: OperationCode,
  messageCode: string
) => {
  return [
    status,
    messageCode.padStart(2, "0"),
    operation.padStart(3, "0"),
  ].join("");
};

const getSuccessMessage = (operation: OperationCode, categoryName: string) =>
  `${categoryName}を${getOperationName(operation)}しました`;

const getErrorMessage = (
  operation: OperationCode,
  status: MessageStatus,
  categoryName: string,
  messageCode: string
) =>
  `${categoryName}の${getOperationName(
    operation
  )}に失敗しました(${getMessageCode(status, operation, messageCode)})`;

const buildMessage =
  (categoryName: string, messageCode: string) =>
  (status: MessageStatus, operation: OperationCode) => {
    switch (status) {
      case MessageStatus.ERROR:
        return getErrorMessage(
          operation,
          status,
          categoryName,
          messageCode
        );
      case MessageStatus.SUCCESS:
        return getSuccessMessage(operation, categoryName);
      default:
        throw new Error(`Invalid message status: ${status}`);
    }
  };

export const createMessage = (
  categoryName: string,
  options: MessageFactoryOptions = {}
): MessageGenerator => {
  const messageCode = options.messageCode ?? MessageCategory.HolidayCalendar;
  const getMessage = buildMessage(categoryName, messageCode);
  return {
    getCategoryName: () => categoryName,
    get: (status) => getMessage(status, OperationCode.Get),
    create: (status) => getMessage(status, OperationCode.Create),
    update: (status) => getMessage(status, OperationCode.Update),
    delete: (status) => getMessage(status, OperationCode.Delete),
  };
};
