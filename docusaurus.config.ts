import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Koreo',
  tagline: 'The platform engineering toolkit for Kubernetes',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://koreo.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/koreo-dev/koreo.dev/blob/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/koreo-dev/koreo.dev/blob/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
      rel: 'stylesheet',
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
      rel: 'stylesheet',
    },
  ],

  themeConfig: {
    metadata: [
      { name: 'keywords', content: 'YAML, Infrastructure as Code, IaC, Platform Engineering, DevOps, Kubernetes, Configuration Management, Resource Orchestration, Helm, Kustomize, Koreo' },

      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Koreo' },
      { property: 'og:description', content: 'A new approach to Kubernetes configuration management and resource orchestration.' },
      { property: 'og:url', content: 'https://koreo.dev' },
      { property: 'og:image', content: 'https://koreo.dev/img/og-image.jpg' },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Koreo' },
      { name: 'twitter:description', content: 'A new approach to Kubernetes configuration management and resource orchestration.' },
      { name: 'twitter:image', content: 'https://koreo.dev/img/og-image.jpg' },
      { name: 'twitter:site', content: '@real_kinetic' }
    ],

    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
    },

    navbar: {
      logo: {
        alt: 'Koreo',
        src: 'img/koreo-logo.png',
      },
      items: [
        {
          label: 'Compared To',
          type: 'dropdown',
          items: [
            {
              label: 'Helm',
              to: '/compare/helm',
            },
            {
              label: 'Kustomize',
              to: '/compare/kustomize',
            },
            {
              label: 'Argo Workflows',
              to: '/compare/argo',
            },
            {
              label: 'Crossplane',
              to: '/compare/crossplane',
            },
          ]
        },
        {
          label: 'Documentation',
          position: 'left',
          to: '/docs/overview',
        },
        {
          label: 'Blog',
          to: 'https://realkinetic.substack.com/s/koreo',
          position: 'left'
        },
        {
          label: 'GitHub',
          to: 'https://github.com/koreo-dev',
          position: 'left'
        },
        {
          label: 'Konfigurate Platform',
          to: 'https://konfigurate.com',
          position: 'right'
        },
        {
          label: 'Real Kinetic',
          to: 'https://realkinetic.com',
          position: 'right',
        },
      ],
    },
    footer: {
      logo: {
        alt: 'Koreo',
        src: 'img/konfig-icon-logo.svg',
        href: '/',
      },
      links: [
        {
          title: "Koreo",
          items: [
            {
              label: 'Documentation',
              to: '/docs/overview',
            },
            {
              label: 'Blog',
              to: 'https://realkinetic.substack.com/s/koreo',
            },
            {
              label: 'GitHub',
              to: 'https://github.com/koreo-dev',
            }
          ],
        },
        {
          title: 'Compared To',
          items: [
            {
              label: 'Helm',
              href: '/compare/helm',
            },
            {
              label: 'Kustomize',
              href: '/compare/kustomize',
            },
            {
              label: 'Argo Workflows',
              href: '/compare/argo',
            },
            {
              label: 'Crossplane',
              href: '/compare/crossplane',
            },
          ]
        },
        {
          title: 'About Real Kinetic',
          items: [
            {
              label: 'Who we are',
              to: 'https://realkinetic.com',
            },
            {
              label: 'Konfigurate Platform',
              to: 'https://konfigurate.com',
            },
            {
              label: 'Our blog',
              to: 'https://realkinetic.substack.com/',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Real Kinetic, LLC<br />Boulder, CO`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
