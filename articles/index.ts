/**
 * Each key corresponds to filename `articles/${key}.md`.
 */
export const articlesMeta = {
  test: {
    key: 'test',
    label: 'test',
    info: 'Test page for development purposes',
    timestamp: '2021-07-19',
    part: -1,
    index: '',
    prev: null,
    next: null,
  },
  'home-page': {
    key: 'home-page',
    label: '',
    info: 'The home page',
    timestamp: '2021-07-19',
    part: -1,
    index: '',
    prev: null,
    next: null,
  },

  objective: {
    key: 'objective',
    label: 'objective',
    info: 'We outline our overall objective',
    timestamp: '2021-07-19',
    part: 1,
    index: '1a',
    prev: null,
    next: 'constraints',
  },
  constraints: {
    key: 'constraints',
    label: 'constraints',
    info: 'We constrain the tech we\'ll use, the low-level game mechanics, and also the backdrop',
    timestamp: '2021-07-19',
    part: 1,
    index: '1b',
    prev: 'objective',
    next: 'technology',
  },
  technology: {
    key: 'technology',
    label: 'technology',
    info: 'We list the tech we\'ll use and discuss JavaScript components',
    timestamp: '2021-07-19',
    part: 1,
    index: '1c',
    prev: 'constraints',
    next: 'tech-1',
  },
  'tech-1': {
    key: 'tech-1',
    label: 'tech: js',
    info: 'Our choice of JavaScript components',
    timestamp: '2021-07-19',
    part: 2,
    index: '2a',
    prev: 'technology',
    next: 'tech-2',
  },
  'tech-2': {
    key: 'tech-2',
    label: 'tech: ai',
    info: 'We describe tech directly related to game mechanics',
    timestamp: '2021-07-19',
    part: 2,
    index: '2b',
    prev: 'tech-1',
    next: 'tech-3',
  },
  'tech-3': {
    key: 'tech-3',
    label: 'tech: dev',
    info: 'Concerning our dev env and in-browser terminal',
    timestamp: '2021-07-19',
    part: 2,
    index: '2c',
    prev: 'tech-2',
    next: 'geomorphs',
  },
  geomorphs: {
    key: 'geomorphs',
    label: 'geomorphs',
    info: 'Concerning our approach to Starship Geomorphs',
    timestamp: '2021-07-19',
    part: 3,
    index: '3a',
    prev: 'tech-3',
    next: null,
  },
} as const;

export type ArticleKey = keyof typeof articlesMeta;
export type ArticleMeta = typeof articlesMeta[ArticleKey];

const realArticles = Object.values(articlesMeta).filter(x => x.part > 0);

export const navGroups = realArticles.reduce((agg, item) => {
  (agg[item.part] = agg[item.part] || []).push(item);
  return agg;
}, [] as ArticleMeta[][]);

const pagePrefix = '/part/';

export function getArticleHref(meta: ArticleMeta) {
  return `${pagePrefix}${meta.part}#article-${meta.key}`;
}
