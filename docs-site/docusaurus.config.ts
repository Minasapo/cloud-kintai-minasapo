import type * as Preset from "@docusaurus/preset-classic";
import type { Config, Plugin } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

type WebpackWarningLike = {
  message?: unknown;
  moduleIdentifier?: unknown;
  module?: {
    resource?: unknown;
  };
};

const MERMAID_SERVER_WARNING_MESSAGE =
  "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted";
const MERMAID_SERVER_WARNING_MODULE =
  "vscode-languageserver-types/lib/umd/main.js";

function shouldIgnoreMermaidServerWarning(warning: WebpackWarningLike) {
  const message =
    typeof warning.message === "string" ? warning.message : "";
  const moduleIdentifier =
    typeof warning.moduleIdentifier === "string"
      ? warning.moduleIdentifier
      : typeof warning.module?.resource === "string"
        ? warning.module.resource
        : "";

  return (
    message.includes(MERMAID_SERVER_WARNING_MESSAGE) &&
    moduleIdentifier.includes(MERMAID_SERVER_WARNING_MODULE)
  );
}

function suppressMermaidServerWarningPlugin(): Plugin {
  return {
    name: "suppress-mermaid-server-warning",
    configureWebpack(_config, isServer) {
      if (!isServer) {
        return {};
      }

      return {
        ignoreWarnings: [shouldIgnoreMermaidServerWarning],
      };
    },
  };
}

const config: Config = {
  title: "クラウド勤怠 ドキュメント",
  tagline: "ロール別に、ユースケースと機能の両軸で辿れる利用ガイド",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://example.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: "/",

  organizationName: "vtj-devops",
  projectName: "garaku-frontend",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "ja",
    locales: ["ja"],
  },

  markdown: {
    mermaid: true,
  },

  themes: ["@docusaurus/theme-mermaid"],

  plugins: [
    suppressMermaidServerWarningPlugin,
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: "docs",
        language: ["ja"],
        hashed: true,
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "クラウド勤怠 ドキュメント",
      logo: {
        alt: "クラウド勤怠ドキュメントのロゴ",
        src: "img/logo.svg",
      },
      items: [
        {
          to: "/docs/staff/overview",
          position: "left",
          label: "スタッフ向けガイド",
        },
        {
          to: "/docs/admin/overview",
          position: "left",
          label: "管理者向けガイド",
        },
        {
          to: "/docs/developer/overview",
          position: "left",
          label: "開発者向けガイド",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "スタッフ向けガイド",
              to: "/docs/staff/overview",
            },
            {
              label: "管理者向けガイド",
              to: "/docs/admin/overview",
            },
            {
              label: "開発者向けガイド",
              to: "/docs/developer/overview",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} contributors.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
