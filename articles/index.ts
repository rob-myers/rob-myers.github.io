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
  },
  'coming-soon': {
    key: 'coming-soon',
    label: 'coming-soon',
    info: 'Placeholder on frontpage',
    timestamp: '2021-07-19',
    part: -1,
  },

  objective: {
    key: 'objective',
    label: 'objective',
    info: 'We outline our overall objective',
    timestamp: '2021-07-19',
    part: 1,
  },
  constraints: {
    key: 'constraints',
    label: 'constraints',
    info: 'We constrain the tech we\'ll use, the low-level game mechanics, and also the backdrop',
    timestamp: '2021-07-19',
    part: 1,
  },
  technology: {
    key: 'technology',
    label: 'technology',
    info: 'We list the tech we\'ll use and discuss JavaScript components',
    timestamp: '2021-07-19',
    part: 2,
  },
  'tech-1': {
    key: 'tech-1',
    label: 'tech: js',
    info: 'Our choice of JavaScript components',
    timestamp: '2021-07-19',
    part: 2,
  },
  'tech-2': {
    key: 'tech-2',
    label: 'tech: ai',
    info: 'We describe tech directly related to game mechanics',
    timestamp: '2021-07-19',
    part: 3,
  },
  'tech-3': {
    key: 'tech-3',
    label: 'tech: dev',
    info: 'Concerning our dev env and in-browser terminal',
    timestamp: '2021-07-19',
    part: 3,
  },
  geomorphs: {
    key: 'geomorphs',
    label: 'geomorphs',
    info: 'Concerning our approach to Starship Geomorphs',
    timestamp: '2021-07-19',
    part: 4,
  },
} as const;

export type ArticleKey = keyof typeof articlesMeta;

export type ArticleMeta = typeof articlesMeta[ArticleKey];

export const navGroups = Object.values(articlesMeta)
  .filter((x) => x.part > 0)
  .reduce((agg, item) => {
    (agg[item.part] = agg[item.part] || []).push(item);
    return agg;
  }, [] as ArticleMeta[][],
);

export const pagePrefix = '/part/';