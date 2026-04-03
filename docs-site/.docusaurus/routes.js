import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '3d7'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '713'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '869'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '8b5'),
            routes: [
              {
                path: '/docs/admin/admin-shift',
                component: ComponentCreator('/docs/admin/admin-shift', 'ea9'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/attendance-management',
                component: ComponentCreator('/docs/admin/attendance-management', 'bdf'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/attendances',
                component: ComponentCreator('/docs/admin/attendances', 'e44'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/daily-report',
                component: ComponentCreator('/docs/admin/daily-report', '3e1'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/dashboard',
                component: ComponentCreator('/docs/admin/dashboard', '93b'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/faq',
                component: ComponentCreator('/docs/admin/faq', '61c'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/navigation-map',
                component: ComponentCreator('/docs/admin/navigation-map', '6c7'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/operation-logs',
                component: ComponentCreator('/docs/admin/operation-logs', '397'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/overview',
                component: ComponentCreator('/docs/admin/overview', 'e4c'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/request-approval',
                component: ComponentCreator('/docs/admin/request-approval', '62b'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/settings-management',
                component: ComponentCreator('/docs/admin/settings-management', '7e3'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/shift-plan',
                component: ComponentCreator('/docs/admin/shift-plan', '738'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/staff-management',
                component: ComponentCreator('/docs/admin/staff-management', 'bf6'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/admin/workflow',
                component: ComponentCreator('/docs/admin/workflow', '43b'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/developer/attendance-error-list-display',
                component: ComponentCreator('/docs/developer/attendance-error-list-display', '711'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/developer/attendance-management-enabled',
                component: ComponentCreator('/docs/developer/attendance-management-enabled', '4de'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/developer/attendance-status-determination',
                component: ComponentCreator('/docs/developer/attendance-status-determination', 'e1a'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/developer/getting-started/setup',
                component: ComponentCreator('/docs/developer/getting-started/setup', '4e7'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/developer/overview',
                component: ComponentCreator('/docs/developer/overview', 'ec9'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '38d'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/attendance-check',
                component: ComponentCreator('/docs/staff/attendance-check', '6c6'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/attendance-edit',
                component: ComponentCreator('/docs/staff/attendance-edit', 'af5'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/attendance-report',
                component: ComponentCreator('/docs/staff/attendance-report', '311'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/basic-operations',
                component: ComponentCreator('/docs/staff/basic-operations', '653'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/dashboard',
                component: ComponentCreator('/docs/staff/dashboard', '971'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/faq',
                component: ComponentCreator('/docs/staff/faq', '959'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/navigation-map',
                component: ComponentCreator('/docs/staff/navigation-map', '30b'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/overview',
                component: ComponentCreator('/docs/staff/overview', '11a'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/request-check',
                component: ComponentCreator('/docs/staff/request-check', 'a65'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/shift',
                component: ComponentCreator('/docs/staff/shift', 'fea'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/time-recording',
                component: ComponentCreator('/docs/staff/time-recording', 'ba8'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/docs/staff/workflow',
                component: ComponentCreator('/docs/staff/workflow', '162'),
                exact: true,
                sidebar: "mainSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
