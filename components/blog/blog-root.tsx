import dynamic from 'next/dynamic';
import TestBlog from './test-blog.mdx';
import css from './blog.scss';

const DevEditor = dynamic(import('@components/dev-env/dev-editor'), { ssr: false });

const BlogRoot: React.FC = () => {
  return (
    <div className={css.root}>
      <TestBlog/>
      <div style={{ height: 500 }}>
        <DevEditor
          panelKey={'test-panel'}
          filename={'package/intro/app.tsx'}
        />
      </div>
    </div>
  );
};

export default BlogRoot;