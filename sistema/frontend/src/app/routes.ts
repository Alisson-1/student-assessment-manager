export const routes = {
  home: '/',
  students: '/students',
  classes: '/classes',
  assessments: '/assessments',
} as const;

export type RoutePath = (typeof routes)[keyof typeof routes];
