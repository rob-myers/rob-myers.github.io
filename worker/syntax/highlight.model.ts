export function flattenTokens(tokens: (string | Prism.Token)[]) {
  return tokens.reduce((prev, token) => {
    if (!(typeof token === 'string') && token.type === 'tag') {
      prev.push(...flattenTagToken(token));
    } else {
      prev.push(token);
    }
    return prev;
  }, [] as (string | Prism.Token)[]);
}

/**
 * TODO understand
 */
function flattenTagToken(token: Prism.Token): Prism.Token[] {
  if (!Array.isArray(token.content)) {
    return [token];
  }

  type Token = Prism.Token & { content: [Token, Token[]] }
  const inner = (token as Token).content[0];

  const isEndTag = inner.content[0].content === '</';
  if (isEndTag) {
    return [
      {
        type: 'end-tag-start',
        content: '</',
        length: 2,
      },
      inner.content[1] ? {
        type: 'end-tag-name',
        content: inner.content[1],
        length: inner.content[1].length,
      } : null,
      ...token.content.slice(1, token.content.length - 1),
      {
        type: 'end-tag-end',
        content: '>',
        length: 1,
      },
    ].filter(Boolean) as Prism.Token[];
  }

  let arr = [...token.content];
  const result = [] as Token[];
  while (arr.length) {
    const t = arr.shift() as Token;
    if (/attr-name|attr-value/.test(t.type)) result.push(t);
    else if (/spread/.test(t.type)) {
      result.push({
        ...t.content[0],
        type: 'jsx-exp-start',
      });
      result.push(...(t.content.slice(1, t.content.length - 1) as Token[]));
      result.push({ ...t.content[t.content.length - 1], type: 'jsx-exp-end'} as Token);
    } else if (t.type === 'script') {
      const i = t.content.findIndex(c => 'content' in c && c.content === '{');
      result.push(...[
        ...t.content.slice(0, i),
        {
          ...t.content[i],
          type: 'jsx-exp-start',
        },
        ...t.content.slice(i + 1, t.content.length - 1),
        // ...findJsxText(t.content.slice(i + 1, t.content.length - 1), 0),
        {
          ...t.content[t.content.length - 1],
          type: 'jsx-exp-end',
        },
      ] as Token[]);
    } else if (Array.isArray(t.content)) {
      arr = [...t.content, ...arr] as Token[];
    }
    else result.push(t);
  }
  result[0].type = 'tag-start';
  result[1] = {
    type: 'start-tag-name',
    length: result[1].length,
    content: result[1] as any,
  } as Token;
  result[result.length - 1].type = 'tag-end';

  return result;
}

export interface Classification {
  start: number;
  end: number;
  kind: string;
  startLine: number;
  endLine: number;
}

export function getLineNumberAndOffset(start: number, lines: number[]) {
  let line = 0;
  let offset = 0;
  while (offset + lines[line] < start) {
    offset += lines[line] + 1;
    line += 1;
  }

  return { line: line + 1, offset };
}
