import TestBlog from './test-blog.mdx';
import DevEnv from '@components/dev-env/dev-env';
import css from './blog.scss';

const BlogRoot: React.FC = () => {
  return (
    <div className={css.root}>
      <TestBlog/>
      {/* <DevEnv /> */}
    </div>
  );
};

export default BlogRoot;