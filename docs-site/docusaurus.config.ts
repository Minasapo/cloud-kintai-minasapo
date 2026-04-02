import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "クラウド勤怠 ドキュメント",
  tagline: "一般向けと開発者向けのガイド",
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
        alt: "Garaku Frontend Docs Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          to: "/docs/user/overview",
          position: "left",
          label: "一般向け",
        },
        {
          to: "/docs/developer/overview",
          position: "left",
          label: "開発者向け",
        },
        {
          href: "https://github.com/vtj-devops/garaku-frontend",
          label: "GitHub",
          position: "right",
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
              label: "一般向け",
              to: "/docs/user/overview",
            },
            {
              label: "開発者向け",
              to: "/docs/developer/overview",
            },
          ],
        },
        {
          title: "Project",
          items: [
            {
              label: "Repository",
              href: "https://github.com/vtj-devops/garaku-frontend",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} garaku-frontend contributors.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
