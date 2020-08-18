import Defs from './defs.mdx';
import css from '../blog.scss';

const BlogDefs: React.FC = () => {
  return (
    <div className={css.root}>
      <Defs />
    </div>
  );
};

export default BlogDefs;