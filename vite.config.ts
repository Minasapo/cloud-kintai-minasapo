import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

const chunkMatchers = [
  {
    name: "vendor-react",
    test: /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|history|@remix-run)\//,
  },
  {
    name: "vendor-mui-core",
    test: /node_modules\/@mui\/(?:material|system|base|styled-engine|utils)\/|node_modules\/@emotion\//,
  },
  {
    name: "vendor-mui-x",
    test: /node_modules\/@mui\/x-/,
  },
  {
    name: "vendor-aws-amplify",
    test: /node_modules\/(aws-amplify|@aws-amplify|amazon-cognito-identity-js|@aws-crypto)/,
  },
  {
    name: "vendor-aws-sdk",
    test: /node_modules\/@aws-sdk\//,
  },
  {
    name: "vendor-state",
    test: /node_modules\/(?:@reduxjs|redux|react-redux|xstate|immer|reselect)/,
  },
  {
    name: "vendor-forms",
    test: /node_modules\/(react-hook-form|zod)/,
  },
  {
    name: "vendor-visualization",
    test: /node_modules\/(?:d3-|qrcode|notistack)/,
  },
  {
    name: "vendor-aws-ui",
    test: /node_modules\/@aws-amplify\/ui-/,
  },
];

const awsAmplifyChunkName = (id: string) => {
  const scopedMatch = id.match(/node_modules\/@aws-amplify\/([^/]+)/);
  if (scopedMatch) {
    const packageName = scopedMatch[1];
    return `vendor-aws-amplify-${packageName}`;
  }
  if (id.includes("node_modules/aws-amplify/")) {
    return "vendor-aws-amplify-core";
  }
  return undefined;
};

const manualChunks = (id: string) => {
  if (!id.includes("node_modules")) return undefined;
  const awsChunk = awsAmplifyChunkName(id);
  if (awsChunk) return awsChunk;
  const matched = chunkMatchers.find((matcher) => matcher.test.test(id));
  if (matched) return matched.name;
  return "vendor-misc";
};

const shouldUseManualChunks = process.env.ENABLE_MANUAL_CHUNKS === "true";
const checkerOverlayEnabled = process.env.VITE_CHECKER_OVERLAY !== "false";

export default defineConfig({
  server: {
    host: true,
    open: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
      src: path.resolve(__dirname, "./src/"),
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: shouldUseManualChunks ? manualChunks : undefined,
      },
    },
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    tsconfigPaths(),
    checker({
      typescript: true,
      overlay: checkerOverlayEnabled,
    }),
  ],
  assetsInclude: ["**/*.csv", "**/*.png"],
  define: {
    global: "window",
  },
});
