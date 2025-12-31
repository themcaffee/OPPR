import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'OPPRS',
  description: 'Open Pinball Player Ranking System - Documentation',
  base: '/OPPR/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'API Reference', link: '/api-reference' },
      { text: 'Demo', link: 'https://themcaffee.github.io/OPPR/demo/' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Getting Started', link: '/getting-started' },
        ],
      },
      {
        text: 'Guide',
        items: [
          { text: 'Configuration', link: '/configuration' },
          { text: 'Core Concepts', link: '/core-concepts' },
          { text: 'Constants & Calibration', link: '/constants' },
        ],
      },
      {
        text: 'Backend',
        items: [
          { text: 'Database (Prisma)', link: '/db-prisma' },
          { text: 'REST API', link: '/rest-api' },
        ],
      },
      {
        text: 'Apps',
        items: [{ text: 'Frontend (Next.js)', link: '/frontend-next' }],
      },
      {
        text: 'Reference',
        items: [{ text: 'API Reference', link: '/api-reference' }],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/themcaffee/OPPR' }],
    footer: {
      message: 'Released under the MIT License.',
    },
  },
});
