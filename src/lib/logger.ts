type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const shouldLog = (configuredLevel: LogLevel, targetLevel: LogLevel) =>
  LEVEL_PRIORITY[targetLevel] <= LEVEL_PRIORITY[configuredLevel];

/**
 * Get the log level from environment variables.
 * Defaults to WARN in production, DEBUG in development.
 */
const getDefaultLogLevel = (): LogLevel => {
  // Check if we're in a browser environment with Vite
  if (typeof window !== "undefined" && "import" in globalThis) {
    try {
      const importMeta = (
        globalThis as typeof globalThis & {
          import?: { meta?: { env?: Record<string, unknown> } };
        }
      ).import;
      if (importMeta?.meta?.env) {
        const envLevel = importMeta.meta.env.VITE_LOG_LEVEL as
          | LogLevel
          | undefined;
        if (envLevel && envLevel in LEVEL_PRIORITY) {
          return envLevel;
        }
        return importMeta.meta.env.DEV ? "DEBUG" : "WARN";
      }
    } catch {
      // Fall through to default
    }
  }
  // Default for test environment or when import.meta is not available
  return "WARN";
};

export class Logger {
  private readonly namespace: string;

  private readonly level: LogLevel;

  constructor(namespace: string, level?: LogLevel) {
    this.namespace = namespace;
    this.level = level ?? getDefaultLogLevel();
  }

  debug(...args: unknown[]) {
    if (!shouldLog(this.level, "DEBUG")) return;

    // eslint-disable-next-line no-console
    console.debug(`[${this.namespace}]`, ...args);
  }

  info(...args: unknown[]) {
    if (!shouldLog(this.level, "INFO")) return;

    // eslint-disable-next-line no-console
    console.info(`[${this.namespace}]`, ...args);
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

/**
 * Create a logger instance for a specific namespace.
 * @param namespace - The namespace for the logger (e.g., 'AttendanceEdit', 'AdminStaff')
 * @param level - Optional log level override
 */
export const createLogger = (namespace: string, level?: LogLevel): Logger => {
  return new Logger(namespace, level);
};
