type LogLevel = "ERROR" | "WARN" | "DEBUG";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  ERROR: 0,
  WARN: 1,
  DEBUG: 2,
};

const shouldLog = (configuredLevel: LogLevel, targetLevel: LogLevel) =>
  LEVEL_PRIORITY[targetLevel] <= LEVEL_PRIORITY[configuredLevel];

export class Logger {
  private readonly namespace: string;

  private readonly level: LogLevel;

  constructor(namespace: string, level: LogLevel = "WARN") {
    this.namespace = namespace;
    this.level = level;
  }

  debug(...args: unknown[]) {
    if (!shouldLog(this.level, "DEBUG")) return;

    // eslint-disable-next-line no-console
    console.debug(`[${this.namespace}]`, ...args);
  }

  warn(...args: unknown[]) {
    if (!shouldLog(this.level, "WARN")) return;

    // eslint-disable-next-line no-console
    console.warn(`[${this.namespace}]`, ...args);
  }

  error(...args: unknown[]) {
    if (!shouldLog(this.level, "ERROR")) return;

    // eslint-disable-next-line no-console
    console.error(`[${this.namespace}]`, ...args);
  }
}
