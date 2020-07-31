import dynamic from 'next/dynamic';
import TestBlog from './test-blog.mdx';
import css from './blog.scss';

const DevEditor = dynamic(import('@components/dev-env/dev-editor'), { ssr: false });
// Had issue with portals and SSR
const DevApp = dynamic(import('@components/dev-env/dev-app'), { ssr: false });

const BlogRoot: React.FC = () => {
  return (
    <div className={css.root}>
      <TestBlog/>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 400, height: 500 }}>
          <DevEditor
            panelKey="test-code-panel"
            filename="package/intro/app.tsx"
          />
        </div>
        <div style={{ width: 400, height: 500 }}>
          <DevApp
            panelKey="test-dev-panel"
          />
        </div>
      </div>
    </div>
  );
};

export default BlogRoot;