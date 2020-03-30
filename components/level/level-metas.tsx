import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LevelState } from '@model/level/level.model';
import { LevelMeta, metaPointRadius } from '@model/level/level-meta.model';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { Act } from '@store/level.duck';
import { NavPath } from '@model/nav/nav-path.model';
import { KeyedLookup, mapValues } from '@model/generic.model';
import { addToLookup } from '@model/redux.model';
import css from './level.scss';
import { Rect2Json } from '@model/rect2.model';

type MetaLookup = LevelState['metas'];

const LevelMetas: React.FC<Props> = ({ levelUid, overlayRef }) => {
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const metaUi = useSelector(({ level: { instance } }) => instance[levelUid]?.metaUi);
  const draggedMeta = useSelector(({ level: { instance: { [levelUid]: level } } }) => level.draggedMeta ? level.metaUi[level.draggedMeta] : null);
  const mouseWorld = useSelector(({ level: { instance } }) => draggedMeta && instance[levelUid]?.mouseWorld);
  const wheelFowarder = useSelector(({ level: { instance } }) => instance[levelUid].wheelForwarder);
  const theme = useSelector(({ level: { instance } }) => instance[levelUid].theme);
  const showNavRects = useSelector(({ level: { instance } }) => instance[levelUid].showNavRects);

  const [levelMetas, setLevelMetas] = useState<MetaLookup>({});
  const [navPaths, setNavPaths] = useState<KeyedLookup<NavPath>>({});
  const [rects, setRects] = useState([] as Rect2Json[]);

  const dispatch = useDispatch();

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      if ('levelUid' in msg && msg.levelUid !== levelUid) {
        return;
      }
      switch (msg.key) {
        case 'send-level-metas': {
          const metas = msg.metas.map(p => LevelMeta.fromJson(p))
            .reduce<MetaLookup>((agg, item) => ({ ...agg, [item.key]: item }), {}); 
          setLevelMetas(metas);
          dispatch(Act.syncMetaUi(levelUid, Object.values(metas)));
          break;
        }
        case 'send-level-aux': {
          setNavPaths(mapValues(msg.toNavPath, (p) => NavPath.from(p)));
          break;
        }
        case 'send-nav-path': {
          // NOTE cannot use state variable because in stale scope
          setNavPaths((prev) => addToLookup(NavPath.from(msg.navPath), prev));
          break;
        }
        case 'send-level-nav-rects': {
          setRects(msg.rects);
          break;
        }
      }
    });
    worker.postMessage({ key: 'request-level-metas', levelUid });
    return () => sub.unsubscribe();
  }, []);

  const focusLevelKeys = () =>
    overlayRef.current?.parentElement?.parentElement?.parentElement?.focus();

  const addTag = (metaKey: string, tag: string) => {
    if (/^[a-z0-9][a-z0-9-]*$/.test(tag)) {
      worker.postMessage({ key: 'update-level-meta', levelUid, metaKey, update: { key: 'add-tag', tag }});
      return true;
    } else if (tag === '-') {
      worker.postMessage({ key: 'remove-level-meta', levelUid, metaKey });
      focusLevelKeys();
    } else if (/^>[a-z0-9][a-z0-9-]*$/.test(tag)) {
      // Draw navpath to first meta with tag `tag.slice(1)`;
      const { position } = levelMetas[metaKey];
      const dstMeta = Object.values(levelMetas).find(({ tags }) => tags.includes(tag.slice(1)));
      if (dstMeta) {
        worker.postMessage({ key: 'request-nav-path', levelUid,
          navPathUid: `${metaKey}>${dstMeta.key}`,
          src: position.json,
          dst: dstMeta.position.json,
        });
        return true;
      }
    }
  };

  const removeTag = (metaKey: string, tag: string) =>
    worker.postMessage({ key: 'update-level-meta', levelUid, metaKey, update: { key: 'remove-tag', tag }});

  const closeMeta = (metaKey: string) => {
    dispatch(Act.updateMetaUi(levelUid, metaKey, { open: false }));
    focusLevelKeys();
  };

  return (
    <>
      <g className={css.metas}>
        {Object.values(levelMetas).map(({ position, key, light }) =>
          <g key={key}>
            <circle
              cx={position.x}
              cy={position.y}
              r={metaPointRadius}
            />
            {light && (
              <>
                <radialGradient
                  id={`light-radial-${key}`}
                  cx={0}
                  cy={0}
                  gradientTransform={`
                    translate(${light.sourceRatios.x}, ${light.sourceRatios.y})
                    scale(${light.scale / light.scaleX}, ${light.scale /light.scaleY})
                  `}
                >
                  {
                    theme === 'light-mode' && (
                      <>
                        <stop offset="0%" style={{ stopColor: 'rgba(0, 0, 0, 0.1)' }} />
                        <stop offset="95%" style={{ stopColor: 'rgba(0, 0, 0, 0.1)' }} />
                        <stop offset="100%" style={{ stopColor: 'rgba(0, 0, 0, 0)' }} />
                      </>
                    ) || (
                      <>
                        <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 230, 0.25)' }} />
                        <stop offset="50%" style={{ stopColor: 'rgba(255, 255, 230, 0.1)' }} />
                        <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0)' }} />
                      </>
                    )
                  }
                </radialGradient>
                <path
                  key={`light-${key}`}
                  d={light.polygon.svgPath}
                  fill={`url(#light-radial-${key})`}
                  strokeWidth={0}
                />
              </>
            )}
          </g>
        )}
        {draggedMeta && mouseWorld &&
          <g className={css.dragIndicator}>
            <line
              x1={draggedMeta.position.x}
              y1={draggedMeta.position.y}
              x2={mouseWorld.x}
              y2={mouseWorld.y}
            />
            <circle cx={mouseWorld.x} cy={mouseWorld.y} r={1}/>
          </g>
        }
      </g>
      <g className={css.navPaths}>
        {Object.values(navPaths).map((navPath) =>
          <g key={navPath.key}>
            {navPath.points.map(({ x, y }, i) =>
              <circle key={`node-${i}`} cx={x} cy={y} r={0.5} />
            )}
            {navPath.edges.map(({ src, dst }, i) =>
              <line key={`edge-${i}`} x1={src.x} y1={src.y} x2={dst.x} y2={dst.y} />
            )}
          </g>
        )}
      </g>
      {showNavRects && (
        <g className={css.rects}>
          {rects.map(([x, y, width, height], i) => (
            <rect
              key={i}
              fill="none"
              stroke="rgba(200, 0, 0, 0.5)"
              strokeWidth={0.5}
              x={x}
              y={y}
              width={width}
              height={height}
            />
          ))}
        </g>
      )}
      {// Popovers
        overlayRef.current && (
          ReactDOM.createPortal(
            Object.values(levelMetas).map(({ key, tags }) => (
              metaUi[key] && metaUi[key].open && (
                <section
                  key={key}
                  className={css.metaPopover}
                  style={{
                    left: metaUi[key].dialogPosition.x,
                    top: metaUi[key].dialogPosition.y,
                    pointerEvents: draggedMeta ? 'none' : 'all',
                  }}
                  onWheel={(e) => {
                    /**
                     * Forward wheel events to LevelMouse,
                     * so can pan/zoom over popover.
                     */
                    wheelFowarder?.next({ key: 'wheel', e });
                  }}
                >
                  <section className={css.content}>
                    <input
                      // Tab focus can break svg height due to parent with overflow hidden (?)
                      tabIndex={-1}
                      placeholder="tag"
                      onKeyPress={({ key: inputKey, currentTarget, currentTarget: { value } }) =>
                        inputKey === 'Enter' && addTag(key, value) && (currentTarget.value = '')
                      }
                      // TODO prevent loss of key focus on 'Escape'
                      onKeyDown={({ key: inputKey }) => inputKey === 'Escape' && closeMeta(key)}
                      onKeyUp={(e) => e.stopPropagation()}
                    />
                    <section className={css.tags}>
                      {tags.map((tag) =>
                        <div
                          key={tag}
                          className={css.tag}
                          onClick={() => removeTag(key, tag)}
                        >
                          {tag}
                        </div>
                      )}
                    </section>
                  </section>
                </section>
              )
              
            ))
            , overlayRef.current
          )
        )
      }
    </>
  );
};

interface Props {
  levelUid: string;
  overlayRef: React.RefObject<HTMLElement>;
}

export default LevelMetas;
