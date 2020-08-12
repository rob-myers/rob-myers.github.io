import { useSelector } from 'react-redux';
import * as portals from 'react-reverse-portal';
import Bipartite from '@components/demo/bipartite/app';
import Intro from '@components/demo/intro/app';

/**
 * This permits persistence over different pages.
 * Currently props are unsupported.
 */
const BlogPortals: React.FC = () => {
  const blogPortal = useSelector(({ blog: { portal } }) => portal);

  return (
    <div>
      {Object.values(blogPortal).map(({ key: portalKey, componentKey, portalNode }) => (
        <portals.InPortal key={portalKey} node={portalNode}>
          {componentKey === 'Bipartite' && <Bipartite />}
          {componentKey === 'Intro' && <Intro />}
        </portals.InPortal>
      ))}
    </div>
  );
};

export default BlogPortals;
