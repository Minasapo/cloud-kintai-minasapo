import { Logger } from "../logger";

describe("Logger", () => {
  const consoleDebug = jest
    .spyOn(console, "debug")
    .mockImplementation(() => {});
  const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
  const consoleError = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleDebug.mockRestore();
    consoleWarn.mockRestore();
    consoleError.mockRestore();
  });

  it("logs according to configured level", () => {
    const logger = new Logger("NS", "WARN");

    logger.debug("debug");
    logger.warn("warn");
    logger.error("error");

    expect(consoleDebug).not.toHaveBeenCalled();
    expect(consoleWarn).toHaveBeenCalledWith("[NS]", "warn");
    expect(consoleError).toHaveBeenCalledWith("[NS]", "error");
  });

  it("allows debug when level is DEBUG", () => {
    const logger = new Logger("NS", "DEBUG");

    logger.debug("debug");

    expect(consoleDebug).toHaveBeenCalledWith("[NS]", "debug");
  });

  it("suppresses warn when level is ERROR", () => {
    const logger = new Logger("NS", "ERROR");

    logger.warn("warn");

    expect(consoleWarn).not.toHaveBeenCalled();
  });
});
