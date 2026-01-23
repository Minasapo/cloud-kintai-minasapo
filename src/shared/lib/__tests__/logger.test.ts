import { createLogger, Logger } from "../logger";

describe("Logger", () => {
  const consoleDebug = jest
    .spyOn(console, "debug")
    .mockImplementation(() => {});
  const consoleInfo = jest.spyOn(console, "info").mockImplementation(() => {});
  const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
  const consoleError = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleDebug.mockRestore();
    consoleInfo.mockRestore();
    consoleWarn.mockRestore();
    consoleError.mockRestore();
  });

  it("logs according to configured level", () => {
    const logger = new Logger("NS", "WARN");

    logger.debug("debug");
    logger.info("info");
    logger.warn("warn");
    logger.error("error");

    expect(consoleDebug).not.toHaveBeenCalled();
    expect(consoleInfo).not.toHaveBeenCalled();
    expect(consoleWarn).toHaveBeenCalledWith("[NS]", "warn");
    expect(consoleError).toHaveBeenCalledWith("[NS]", "error");
  });

  it("allows debug when level is DEBUG", () => {
    const logger = new Logger("NS", "DEBUG");

    logger.debug("debug");

    expect(consoleDebug).toHaveBeenCalledWith("[NS]", "debug");
  });

  it("allows info when level is INFO", () => {
    const logger = new Logger("NS", "INFO");

    logger.info("info");
    logger.debug("debug");

    expect(consoleInfo).toHaveBeenCalledWith("[NS]", "info");
    expect(consoleDebug).not.toHaveBeenCalled();
  });

  it("suppresses warn when level is ERROR", () => {
    const logger = new Logger("NS", "ERROR");

    logger.warn("warn");

    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it("createLogger factory creates a logger instance", () => {
    const logger = createLogger("TestNamespace", "DEBUG");

    logger.debug("test");

    expect(consoleDebug).toHaveBeenCalledWith("[TestNamespace]", "test");
  });
});
