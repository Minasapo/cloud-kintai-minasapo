// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder
// Some modules like react-router require these APIs
import { TextDecoder,TextEncoder } from "util";

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder as any;

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
jest.mock("./lib/amplify/graphqlClient", () => ({
  graphqlClient: {
    graphql: jest.fn(),
  },
}));

jest.mock("./lib/amplify/adminQueriesClient", () => ({
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
