import RootLayout from '@components/ui/root-layout';
import DefsMdx from '@blog/defs/defs.mdx';
import css from '@blog/blog.scss';

const Defs: React.FC = () => {
  return (
    <RootLayout>
      <div className={css.root}>
        <DefsMdx />
      </div>
    </RootLayout>
  );
};

export default Defs;
