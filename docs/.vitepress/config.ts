import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'OPPRS',
  description: 'Open Pinball Player Ranking System - Documentation',
  base: '/OPPR/',
  ignoreDeadLinks: [
    /^http:\/\/localhost/,
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'REST API', link: '/rest-api' },
      { text: 'CLI', link: '/cli' },
      { text: 'Frontend', link: '/frontend-next' },
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
        text: 'Applications',
        items: [
          { text: 'REST API', link: '/rest-api' },
          { text: 'CLI', link: '/cli' },
          { text: 'Frontend (Next.js)', link: '/frontend-next' },
        ],
      },
      {
        text: 'Backend Services',
        items: [
          { text: 'Database (Prisma)', link: '/db-prisma' },
        ],
      },
      {
        text: 'Core Library',
        items: [
          { text: 'Core Concepts', link: '/core-concepts' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Constants & Calibration', link: '/constants' },
          { text: 'API Reference', link: '/api-reference' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/themcaffee/OPPR' }],
    footer: {
      message: 'Released under the MIT License.',
    },
  },
});
