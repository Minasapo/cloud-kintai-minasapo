type RetryContext = {
  attempt: number;
  maxAttempts: number;
  error: unknown;
  delayMs: number;
};

export type RetryOptions = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs?: number;
  jitterRatio?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (context: RetryContext) => void;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
};

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const buildRetryDelayMs = (
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  jitterRatio: number,
  random: () => number,
) => {
  const backoffDelay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
  const jitter = backoffDelay * jitterRatio * random();
  return Math.round(backoffDelay + jitter);
};

export async function retryAsync<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const {
    maxAttempts,
    baseDelayMs,
    maxDelayMs = Number.POSITIVE_INFINITY,
    jitterRatio = 0,
    shouldRetry,
    onRetry,
    sleep = defaultSleep,
    random = Math.random,
  } = options;

  if (maxAttempts < 1) {
    throw new Error("maxAttempts must be greater than 0");
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const canRetry = shouldRetry ? shouldRetry(error, attempt) : true;
      const hasNextAttempt = attempt < maxAttempts;

      if (!canRetry || !hasNextAttempt) {
        throw error;
      }

      const delayMs = buildRetryDelayMs(
        attempt,
        baseDelayMs,
        maxDelayMs,
        jitterRatio,
        random,
      );

      onRetry?.({ attempt, maxAttempts, error, delayMs });
      await sleep(delayMs);
    }
  }

  throw new Error("Retry attempts exhausted");
}