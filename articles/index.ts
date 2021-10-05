import testMd from 'articles/test.md';

import objectiveMd from 'articles/objective.md';
import constraintsMd from 'articles/constraints.md';

import technologyMd from 'articles/technology.md';
import techPt2Md from 'articles/tech-pt2.md';
import techPt3Md from 'articles/tech-pt3.md';

import geomorphsMd from 'articles/geomorphs.md';

export const articlesMeta = {
  test: {
    key: 'test',
    label: 'test',
    markdown: testMd,
    timestamp: '2021-07-19',
    page: null,
    href: '/test',
  },

  objective: {
    key: 'objective',
    label: 'Objective',
    markdown: objectiveMd,
    timestamp: '2021-07-19',
    page: 1,
    href: '/blog/1',
  },
  constraints: {
    key: 'constraints',
    label: 'Constraints',
    markdown: constraintsMd,
    timestamp: '2021-07-19',
    page: 1,
    href: '/blog/1',
  },
  technology: {
    key: 'technology',
    label: 'Technology',
    markdown: technologyMd,
    timestamp: '2021-07-19',
    page: 2,
    href: '/blog/2',
  },
  'tech-2': {
    key: 'tech-2',
    label: 'Technology (2)',
    markdown: techPt2Md,
    timestamp: '2021-07-19',
    page: 2,
    href: '/blog/2',
  },
  'tech-3': {
    key: 'tech-3',
    label: 'Technology (3)',
    markdown: techPt3Md,
    timestamp: '2021-07-19',
    page: 2,
    href: '/blog/2',
  },
  geomorphs: {
    key: 'geomorphs',
    label: 'Geomorphs',
    markdown: geomorphsMd,
    timestamp: '2021-07-19',
    page: 3,
    href: '/blog/3',
  },
} as const;

export type ArticleKey = keyof typeof articlesMeta;
