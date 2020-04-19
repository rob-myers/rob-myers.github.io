import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import LevelContent from './level-content';
import LevelMetas from './level-metas';
import LevelCursor from './level-cursor';
import LevelGrid from './level-grid';

const LevelSvgWorld: React.FC<Props> = ({ levelUid, overlayRef }) => {
  const mode = useSelector(({ level: { instance } }) => instance[levelUid]?.mode);
  const renderBounds = useSelector(({ level: { instance } }) => instance[levelUid]?.renderBounds);
  const zoomFactor = useSelector(({ level: { instance } }) => instance[levelUid]?.zoomFactor);

  const scale = `scale(${zoomFactor})`;
  const translate = renderBounds && `translate(${-renderBounds.x}px, ${-renderBounds.y}px)`;

  const levelContent = useMemo(() =>
    <LevelContent levelUid={levelUid} />, []);
  const levelMetas = useMemo(() =>
    <LevelMetas levelUid={levelUid} overlayRef={overlayRef} />, [overlayRef]);

  return (
    <g style={{ transform: scale }}>
      <g style={{ transform: translate }}>
        {levelContent}
        {mode === 'edit' && <LevelCursor levelUid={levelUid} />}
        {levelMetas}
      </g>
      {mode === 'edit' && <LevelGrid levelUid={levelUid} />}
    </g>
  );
};

interface Props {
  levelUid: string;
  overlayRef: React.RefObject<HTMLElement>; // TODO remove
}

export default LevelSvgWorld;
