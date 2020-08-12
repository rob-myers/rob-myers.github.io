// import TestBlog from './test-blog.mdx';
import Blog1 from './blog-1.mdx';
import css from './blog.scss';

const BlogRoot: React.FC = () => {
  return (
    <div className={css.root}>
      <Blog1/>
      {/* <TestBlog/> */}
    </div>
  );
};

export default BlogRoot;