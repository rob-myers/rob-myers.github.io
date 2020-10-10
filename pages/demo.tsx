import RootLayout from '@components/ui/root-layout';
import DemoMdx from '@blog/demo/demo.mdx';
import css from '@blog/blog.scss';

const Demo: React.FC = () => {
  return (
    <RootLayout>
      <div className={css.root}>
        <DemoMdx />
      </div>
    </RootLayout>
  );
};

export default Demo;
