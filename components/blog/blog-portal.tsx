import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as portals from 'react-reverse-portal';
import { BlogAppKey } from '@store/blog.duck';

const DevApp: React.FC<Props> = ({ to: componentKey, portalKey }) => {
  const portalNode = useSelector(({ blog: { portal } }) =>
    portal[portalKey]?.portalNode);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!portalNode) {
      dispatch({ type: '[blog] create component portal', args: { componentKey, portalKey } });
    }
  }, [portalNode]);

  return (
    portalNode ? (// See BlogPortals
      <portals.OutPortal node={portalNode} />
    ) : null
  );
};

interface Props {
  /** Component key e.g. `MyComponent` */
  to: BlogAppKey;
  portalKey: string;
}

export default DevApp;