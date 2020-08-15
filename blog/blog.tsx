import Blog1 from './1/blog-1.mdx';
import Blog2 from './2/blog-2.mdx';
import css from './blog.scss';

const BlogRoot: React.FC = () => {
  return (
    <div className={css.root}>
      <Blog1/>
      <Blog2/>
    </div>
  );
};

export default BlogRoot;