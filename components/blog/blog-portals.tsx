import { useSelector } from 'react-redux';
import * as portals from 'react-reverse-portal';
import Bipartite from '@components/demo/bipartite/app';
import Intro from '@components/demo/intro/app';

/**
 * Portals where pre-built components can be rendered.
 * This permits persistence over different pages.
 * Currently props are unsupported.
 */
const BlogPortals: React.FC = () => {
  const blogPortal = useSelector(({ blog: { portal } }) => portal);

  return (
    <div>
      {Object.values(blogPortal).map(({ key: portalKey, componentKey, portalNode }) => (
        <portals.InPortal key={portalKey} node={portalNode}>
          {componentKey === 'bipartite' && <Bipartite />}
          {componentKey === 'intro' && <Intro />}
        </portals.InPortal>
      ))}
    </div>
  );
};

export default BlogPortals;
