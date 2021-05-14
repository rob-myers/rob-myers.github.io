import { useEffect, useRef } from 'react';
import * as portals from 'react-reverse-portal';

const StagePortal: React.FC<Props> = ({ node }) => {
  const root = useRef<any>(null);

  useEffect(() => {
    const elem = (root.current!.currentPortalNode.element as HTMLElement);
    elem.style.gridArea = 'stage';
    elem.style.width = elem.style.height = '100%';
  }, [node]);

  return <portals.OutPortal ref={root} node={node} />;
};

interface Props {
  node: portals.HtmlPortalNode;
}

export default StagePortal;
