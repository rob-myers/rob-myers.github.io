import RootLayout from '@components/ui/root-layout';
import MetaMdx from '@blog/meta/meta.mdx';
import css from '@blog/blog.scss';

const Meta: React.FC = () => {
  return (
    <RootLayout>
      <div className={css.root}>
        <MetaMdx />
      </div>
    </RootLayout>
  );
};

export default Meta;
