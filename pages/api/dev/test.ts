import type { NextApiRequest, NextApiResponse } from 'next'

export default async function (_req: NextApiRequest, res: NextApiResponse) {
  res.json([
    'foo',
    'bar',
    'baz',
    'qux',
  ]);
}
