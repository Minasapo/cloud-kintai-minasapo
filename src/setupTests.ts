// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder
// Some modules like react-router require these APIs
import { TextDecoder, TextEncoder } from "util";

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder =
  TextDecoder as unknown as typeof globalThis.TextDecoder;

class MockHeaders {
  private readonly values = new Map<string, string>();

  constructor(
    init?: Record<string, string> | Array<[string, string]> | MockHeaders,
  ) {
    if (!init) {
      return;
    }

    if (init instanceof MockHeaders) {
      init.forEach((value, key) => this.set(key, value));
      return;
    }

    if (Array.isArray(init)) {
      init.forEach(([key, value]) => this.set(key, value));
      return;
    }

    Object.entries(init).forEach(([key, value]) => this.set(key, value));
  }

  append(key: string, value: string) {
    this.set(key, value);
  }

  get(key: string) {
    return this.values.get(key.toLowerCase()) ?? null;
  }

  has(key: string) {
    return this.values.has(key.toLowerCase());
  }

  set(key: string, value: string) {
    this.values.set(key.toLowerCase(), value);
  }

  forEach(callback: (value: string, key: string) => void) {
    this.values.forEach((value, key) => callback(value, key));
  }
}

class MockRequest {
  url: string;
  method: string;
  headers: MockHeaders;
  signal: AbortSignal | null;

  constructor(
    input: string | URL | { url: string },
    init?: {
      method?: string;
      headers?: Record<string, string> | Array<[string, string]> | MockHeaders;
      signal?: AbortSignal;
    },
  ) {
    this.url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    this.method = init?.method ?? "GET";
    this.headers = new MockHeaders(init?.headers);
    this.signal = init?.signal ?? null;
  }
}

if (typeof globalThis.Headers === "undefined") {
  globalThis.Headers = MockHeaders as unknown as typeof globalThis.Headers;
}

if (typeof globalThis.Request === "undefined") {
  globalThis.Request = MockRequest as unknown as typeof globalThis.Request;
}

// Mock import.meta.env for Jest
Object.defineProperty(globalThis, "import", {
  value: {
    meta: {
      env: {
        DEV: false,
        VITE_LOG_LEVEL: undefined,
      },
    },
  },
  writable: true,
  configurable: true,
});

// Mock AWS Amplify to avoid configuration warnings in tests
jest.mock("@/shared/api/amplify/graphqlClient", () => ({
  graphqlClient: {
    graphql: jest.fn(),
  },
}));

jest.mock("@/shared/api/amplify/adminQueriesClient", () => ({
  adminQueriesClient: {
    graphql: jest.fn(),
  },
}));

// Mock aws-amplify/api to prevent initialization warnings
jest.mock("aws-amplify/api", () => ({
  generateClient: jest.fn(() => ({
    graphql: jest.fn(),
  })),
}));
