import Meta from './meta/meta.mdx';
import css from './blog.scss';

const BlogMeta: React.FC = () => {
  return (
    <div className={css.root}>
      <Meta />
    </div>
  );
};

export default BlogMeta;