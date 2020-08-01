import TestBlog from './test-blog.mdx';
import css from './blog.scss';

const BlogRoot: React.FC = () => {
  return (
    <div className={css.root}>
      <TestBlog/>
    </div>
  );
};

export default BlogRoot;