import dynamic from 'next/dynamic';
import Defs from './defs.mdx';
import css from '../blog.scss';
import XTermComponent from '@components/xterm/xterm';

const XTerm = dynamic(
  () => import('@components/xterm/xterm'), { ssr: false }) as typeof XTermComponent;

export const Terminal = () => <XTerm onMount={() => {}} />;

const BlogDefs: React.FC = () => {
  return (
    <div className={css.root}>
      <Defs />
    </div>
  );
};

export default BlogDefs;