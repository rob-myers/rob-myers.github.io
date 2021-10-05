import testMd from 'articles/test.md';
import comingSoonMd from 'articles/coming-soon.md';

import objectiveMd from 'articles/objective.md';
import constraintsMd from 'articles/constraints.md';

import technologyMd from 'articles/technology.md';
import techPt1Md from 'articles/tech-pt1.md';
import techPt2Md from 'articles/tech-pt2.md';
import techPt3Md from 'articles/tech-pt3.md';

import geomorphsMd from 'articles/geomorphs.md';

export const articlesMeta = {
  test: {
    key: 'test',
    label: 'test',
    info: 'Test page for development purposes',
    markdown: testMd,
    timestamp: '2021-07-19',
    page: -1,
    href: '',
  },
  'coming-soon': {
    key: 'coming-soon',
    label: 'coming-soon',
    info: 'Placeholder on frontpage',
    markdown: comingSoonMd,
    timestamp: '2021-07-19',
    page: -1,
    href: '',
  },

  objective: {
    key: 'objective',
    label: 'objective',
    info: 'We outline our overall objective',
    markdown: objectiveMd,
    timestamp: '2021-07-19',
    page: 1,
    href: '/blog/1',
  },
  constraints: {
    key: 'constraints',
    label: 'constraints',
    info: 'We constrain the tech we\'ll use, the low-level game mechanics, and also the backdrop',
    markdown: constraintsMd,
    timestamp: '2021-07-19',
    page: 1,
    href: '/blog/1',
  },
  technology: {
    key: 'technology',
    label: 'technology',
    info: 'We list the tech we\'ll use and discuss JavaScript components',
    markdown: technologyMd,
    timestamp: '2021-07-19',
    page: 1,
    href: '/blog/1',
  },
  'tech-1': {
    key: 'tech-1',
    label: 'tech: js',
    info: 'Our choice of JavaScript components',
    markdown: techPt1Md,
    timestamp: '2021-07-19',
    page: 2,
    href: '/blog/2',
  },
  'tech-2': {
    key: 'tech-2',
    label: 'tech: sim',
    info: 'We describe tech directly related to game mechanics',
    markdown: techPt2Md,
    timestamp: '2021-07-19',
    page: 2,
    href: '/blog/2',
  },
  'tech-3': {
    key: 'tech-3',
    label: 'tech: dev',
    info: 'Concerning our dev env and in-browser terminal',
    markdown: techPt3Md,
    timestamp: '2021-07-19',
    page: 2,
    href: '/blog/2',
  },
  geomorphs: {
    key: 'geomorphs',
    label: 'geomorphs',
    info: 'Concerning our approach to Starship Geomorphs',
    markdown: geomorphsMd,
    timestamp: '2021-07-19',
    page: 3,
    href: '/blog/3',
  },
} as const;

export type ArticleKey = keyof typeof articlesMeta;

export type ArticleMeta = typeof articlesMeta[ArticleKey];
