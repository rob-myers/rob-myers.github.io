/* eslint-disable @typescript-eslint/camelcase */
import { gitalkOpts, GitalkOptions } from './gitalk-opts.model';
import { getWindow } from '@model/dom.model';

const baseUrl = 'https://api.github.com';

export const fetchOptions: Parameters<typeof fetch>[1] = {
  headers: {
    Accept: 'application/json',
  },
};

export const GT_ACCESS_TOKEN = 'GT_ACCESS_TOKEN';
export const GT_VERSION = '0.0';
export const GT_COMMENT = 'GT_COMMENT';

function getAccessToken() {
  return getWindow()?.localStorage.getItem(GT_ACCESS_TOKEN) || '__TOKEN_NOT_FOUND__';
}

function getRepoAppUserPass() {
  return `${gitalkOpts.clientID}:${gitalkOpts.clientSecret}`;
}

interface GitHubComment {
  id: number;
  gId: number;
  author: GitalkOptions['defaultAuthor'];
  databaseId: number;
  createdAt: string;
  body: any;
  bodyHTML: string;
  reactions: any[];
}

export interface GitHubIssue {
  comments: {
    nodes: GitHubComment[];
    pageInfo: {
      hasPreviousPage: boolean;
      hasNextPage: boolean;
      startCursor: string;
      endCursor: string;
    };
    totalCount: number;
  };
}
    
export interface GitHubMetaIssue {
  number: number;
  comments_url: string;
  html_url: string;
  comments: number;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
}

function getMainQuery(
  opts: {
    owner: string;
    repo: string;
    id: number;
    pageSize: number;
    cursor?: string;
  },
  pageDirection: 'first' | 'last',
) {
  const cursorDirection = pageDirection === 'last' ? 'before' : 'after';
  const ql = `
  query getIssueAndComments(
    $owner:: string;!,
    $repo:: string;!,
    $id: Int!,
    $cursor:: string;,
    $pageSize: Int!
  ) {
    repository(owner: $owner, name: $repo) {
      issue(number: $id) {
        title
        url
        bodyHTML
        createdAt
        comments(${pageDirection}: $pageSize, ${cursorDirection}: $cursor) {
          totalCount
          pageInfo {
            ${pageDirection === 'last' ? 'hasPreviousPage' : 'hasNextPage'}
            ${cursorDirection === 'before' ? 'startCursor' : 'endCursor'}
          }
          nodes {
            id
            databaseId
            author {
              avatarUrl
              login
              url
            }
            bodyHTML
            body
            createdAt
            reactions(first: 100, content: HEART) {
              totalCount
              viewerHasReacted
              pageInfo{
                hasNextPage
              }
              nodes {
                id
                databaseId
                user {
                  login
                }
              }
            }
          }
        }
      }
    }
  }
  `;

  if (opts.cursor === null) {
    delete opts.cursor;
  }

  return {
    operationName: 'getIssueAndComments',
    query: ql,
    variables: opts,
  };
}


export async function getComments (
  issue: GitHubMetaIssue,
  { cursor, comments }: { cursor?: string; comments: GitHubComment[] },
  accessToken: string,
) {
  const { owner, repo, perPage, pageDirection, defaultAuthor } = gitalkOpts;
  const query = getMainQuery({
    owner,
    repo,
    id: issue.number,
    pageSize: perPage,
    cursor,
  }, pageDirection);

  const response = await fetch(
    `${baseUrl}/graph`, {
      ...fetchOptions,
      method: 'post',
      body: JSON.stringify(query),
      headers: {
        ...fetchOptions?.headers,
        Authorization: `bearer ${accessToken}`,
      },
    },
  );
  const { data } = await response.json() as {
    data: { repository: { issue: GitHubIssue } };
  };

  const { nodes, pageInfo } = data.repository.issue.comments;
  const items = nodes.map((node) => {
    const author = node.author || defaultAuthor;
    return {
      id: node.databaseId,
      gId: node.id,
      user: {
        avatarUrl: author.avatarUrl,
        login: author.login,
        htmlUrl: author.url
      },
      createdAt: node.createdAt,
      bodyHTML: node.bodyHTML,
      body: node.body,
      htmlUrl: `https://github.com/${owner}/${repo}/issues/${issue.number}#issuecomment-${node.databaseId}`,
      reactions: node.reactions,
    };
  });

  return {
    comments: pageDirection === 'last'
      ? [...items, ...comments]
      : [...comments, ...items],
    isLoadOver: pageInfo.hasPreviousPage === false || pageInfo.hasNextPage === false,
    cursor: pageInfo.startCursor || pageInfo.endCursor
  };
}

/**
 * Get comments via older v3 api.
 * Doesn't require login but no sorting.
 */
export async function getCommentsV3(
  page: number,
  issueNumber?: number,
) {
  const { issue } = await getIssue(null, issueNumber);
  if (!issue) {
    return;
  }
  const response = await fetch(`${issue.comments_url}?${
    new URLSearchParams({
      page: `${page}`,
      per_page: `${gitalkOpts.perPage}`,
    })
  }`, {
    ...fetchOptions,
    method: 'get',
    headers: {
      ...fetchOptions?.headers,
      Accept: 'application/vnd.github.v3.full+json',
      Authorization: `Basic ${btoa(getRepoAppUserPass())}`,
    },
  });

  return {
    loadedComments: await response.json() as GitHubComment[],
  };
}

/**
 * TODO logout on throw error.
 */
export async function getUserInfo () {
  const response = await fetch(`${baseUrl}/user`, {
    ...fetchOptions,
    method: 'get',
    headers: {
      ...fetchOptions?.headers,
      Authorization: `token ${getAccessToken()}`,
    }
  });
  return {
    user: await response.json(),
  };
}

export async function createIssue (
  {
    body,
    labels = [],
    title = gitalkOpts.title,
    url = getWindow()?.location.href || '__URL__',
  }: Partial<{
    title: string;
    body: string; 
    labels: string[];
    url: string;
  }>,
) {
  const { owner, repo, id } = gitalkOpts;
  const response = await fetch(`${baseUrl}/repos/${owner}/${repo}/issues`, {
    ...fetchOptions,
    method: 'post',
    headers: {
      ...fetchOptions?.headers,
      Authorization: `token ${getAccessToken()}`,
    },
    body: JSON.stringify({
      title,
      labels: labels.concat(id),
      body: body || `Issue from ${url}`,
    }),
  });

  return {
    issue: await response.json() as GitHubMetaIssue,
  };
}

export async function getIssueById (
  issueNumber: number,
) {
  const getPath = `/repos/${gitalkOpts.owner}/${gitalkOpts.repo}/issues/${issueNumber}`;

  try {
    const response = await fetch(`${baseUrl}${getPath}?${new URLSearchParams({
      t: Date.now().toString(),
    })}`, {
      ...fetchOptions,
      method: 'get',
      headers: {
        ...fetchOptions?.headers,
        Authorization: `Basic ${btoa(getRepoAppUserPass())}`,
      },
    });
    const issue = await response.json() as GitHubMetaIssue;
    return {
      issue,
      matches: issue.number === issueNumber,
    };
  } catch (e) {
    if (e.response?.status === 404) {
      return {
        issue: null as null | GitHubMetaIssue,
        matches: false,
      };
    }
    throw e;
  }
}

export async function getIssueByLabels(
  user: null | GitHubUser,
  labels: string[],
) {
  const getPath = `/repos/${gitalkOpts.owner}/${gitalkOpts.repo}/issues`;

  const response = await fetch(`${baseUrl}${getPath}?${new URLSearchParams({
    labels: [...labels, gitalkOpts.id].join(','),
    t: Date.now().toString(),
  })}`, {
    ...fetchOptions,
    method: 'get',
    headers: {
      ...fetchOptions?.headers,
      Authorization: `Basic ${btoa(getRepoAppUserPass())}`,
    },
  });

  const data = await response.json() as GitHubMetaIssue[];
  const isAdmin = user && gitalkOpts.admin.includes(user.login.toLowerCase());

  if (!data?.length) {
    return {
      issue: !gitalkOpts.createIssueManually && isAdmin
        ? (await createIssue({})).issue
        : null
      ,
      initialising: false,
    };
  }
  return {
    issue: data[0],
    initialising: true,
  };
}

export async function getIssue(
  user: null | GitHubUser,
  issueNumber?: number
) {
  if (issueNumber) {
    const { issue } = await getIssueById(issueNumber);
    if (issue) {
      return { 
        issue,
        initialising: false,
      };
    }
  }
  return await getIssueByLabels(user, []);
}

export async function createComment(
  user: GitHubUser,
  commentText: string,
) {
  const { issue } = await getIssue(user);
  if (!issue) {
    return;
  }

  const response = await fetch(`${issue.comments_url}?${
    new URLSearchParams({
      body: commentText,
    })
  }`, {
    ...fetchOptions,
    method: 'post',
    headers: {
      ...fetchOptions?.headers,
      Accept: 'application/vnd.github.v3.full+json',
      Authorization: `token ${getAccessToken()}`
    },
  });

  return {
    comment: await response.json() as GitHubComment,
  };
}

export function logout () {
  getWindow()?.localStorage.removeItem(GT_ACCESS_TOKEN);
}

export async function like(comment: GitHubComment) {
  const response = await fetch(
    `${baseUrl}/repos/${gitalkOpts.owner}/${gitalkOpts.repo}/issues/comments/${comment.id}/reactions`,
    {
      ...fetchOptions,
      method: 'post',
      headers: {
        ...fetchOptions?.headers,
        Accept: 'application/vnd.github.squirrel-girl-preview',
        Authorization: `token ${getAccessToken()}`,
      },
    });
    
  return {
    comment,
    reactionNode: await response.json(),
  };
}

export  async function unlike(comment: GitHubComment) {
  const getQL = (id: number) => ({
    operationName: 'RemoveReaction',
    query: `
        mutation RemoveReaction{
          removeReaction (input:{
            subjectId: "${id}",
            content: HEART
          }) {
            reaction {
              content
            }
          }
        }
      `
  });

  await fetch(
    `${baseUrl}/graphql`,
    {
      ...fetchOptions,
      method: 'post',
      headers: {
        ...fetchOptions?.headers,
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(getQL(comment.gId)),
    });

}
