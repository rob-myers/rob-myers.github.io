import Blog1 from './entries/blog-1.mdx';
import css from './blog.scss';

const BlogRoot: React.FC = () => {
  return (
    <div className={css.root}>
      <Blog1/>
    </div>
  );
};

export default BlogRoot;