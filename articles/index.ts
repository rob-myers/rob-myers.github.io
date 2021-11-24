/**
 * Each key corresponds to filename `articles/${key}.md`.
 */
export const articlesMeta = {
  'homepage': {
    key: 'homepage',
    label: '',
    info: 'Home page',
    timestamp: '2021-07-19',
    part: -1,
    index: '',
    prev: null,
    next: null,
    tags: [],
  },
  test: {
    key: 'test',
    label: 'test',
    info: 'Test page for development purposes',
    timestamp: '2021-07-19',
    part: -1,
    index: '',
    prev: null,
    next: null,
    tags: [],
  },
  /**
   * Part 1
   */
  objective: {
    key: 'objective',
    label: 'objective',
    info: 'Our overall objective',
    timestamp: '2021-07-19',
    part: 1,
    index: '1a',
    prev: null,
    next: 'constraints',
    tags: ['intent', 'game ai', 'traveller', 'npc','navmesh','geomorph','codesandbox'],
  },
  constraints: {
    key: 'constraints',
    label: 'constraints',
    info: 'Constraints: tech, game mechanics, setting',
    timestamp: '2021-07-19',
    part: 1,
    index: '1b',
    prev: 'objective',
    next: 'finishing',
    tags: ['tech', 'mechanics', 'terminal', 'setting'],
  },
  finishing: {
    key: 'finishing',
    label: 'finishing',
    info: 'Finishing as a skill',
    timestamp: '2021-07-19',
    part: 1,
    index: '1c',
    prev: 'constraints',
    next: 'technology',
    tags: ['finishing as a skill', 'better game ai', 'teleglitch'],
  },
  /**
   * Part 2
   */
  technology: {
    key: 'technology',
    label: 'technology',
    info: 'The tech we\'ll use',
    timestamp: '2021-07-19',
    part: 2,
    index: '2a',
    prev: 'finishing',
    next: 'tech1',
    tags: ['lego bricks', 'specific tech'],
  },
  'tech1': {
    key: 'tech1',
    label: 'tech: js',
    info: 'JavaScript components',
    timestamp: '2021-07-19',
    part: 2,
    index: '2b',
    prev: 'technology',
    next: 'tech2',
    tags: ['javascript', 'react', 'preact', 'jsx', 'performance', 'hot reload'],
  },
  'tech2': {
    key: 'tech2',
    label: 'tech: ai',
    info: 'Tech related to gameplay',
    timestamp: '2021-07-19',
    part: 2,
    index: '2c',
    prev: 'tech1',
    next: 'tech3',
    tags: ['navigation', 'navgraph', 'navmesh', 'string pull',  'steering', 'detour', 'raycast'],
  },
  'tech3': {
    key: 'tech3',
    label: 'tech: dev',
    info: 'Dev env and in-browser terminal',
    timestamp: '2021-07-19',
    part: 2,
    index: '2d',
    prev: 'tech2',
    next: 'geomorphs',
    tags: [],
  },
  /**
   * Part 3
   */
  geomorphs: {
    key: 'geomorphs',
    label: 'geomorphs',
    info: 'How we use Starship Geomorphs',
    timestamp: '2021-07-19',
    part: 3,
    index: '3a',
    prev: 'tech3',
    next: null,
    tags: [],
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
  return `${pagePrefix}${meta.part}#${meta.key}`;
}
