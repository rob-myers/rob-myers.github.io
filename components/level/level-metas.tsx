import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LevelState } from '@model/level/level.model';
import { LevelMetaGroup } from '@model/level/level-meta.model';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { NavPath } from '@model/level/nav/nav-path.model';
import { KeyedLookup, mapValues, posModulo } from '@model/generic.model';
import { addToLookup } from '@model/redux.model';
import { Rect2Json } from '@model/rect2.model';
import { metaPointRadius } from '@model/level/level-params';
import { Act, Thunk } from '@store/level.duck';
import css from './level.scss';
import { LevelIcon } from './level-icon';

type MetaLookup = LevelState['metaGroups'];

const LevelMetas: React.FC<Props> = ({ levelUid, overlayRef }) => {

  const draggedMeta = useSelector(({ level: { instance: { [levelUid]: level } } }) => level.draggedMeta ? level.metaGroupUi[level.draggedMeta] : null);
  const groupUi = useSelector(({ level: { instance } }) => instance[levelUid]?.metaGroupUi);
  const mouseWorld = useSelector(({ level: { instance } }) => draggedMeta && instance[levelUid]?.mouseWorld);
  const showNavRects = useSelector(({ level: { instance } }) => instance[levelUid].showNavRects);
  const theme = useSelector(({ level: { instance } }) => instance[levelUid].theme);
  const worker = useSelector(({ level: { worker } }) => worker)!;
  const wheelFowarder = useSelector(({ level: { instance } }) => instance[levelUid].wheelForwarder);
  const dispatch = useDispatch();

  const [groups, setGroups] = useState<MetaLookup>({});
  const [navPaths, setNavPaths] = useState<KeyedLookup<NavPath>>({});
  const [rects, setRects] = useState([] as Rect2Json[]);

  useEffect(() => {
    const sub = subscribeToWorker(worker, (msg) => {
      if ('levelUid' in msg && msg.levelUid !== levelUid) {
        return;
      }
      switch (msg.key) {
        case 'send-level-metas': {
          const metas = msg.metas.map(p => LevelMetaGroup.from(p))
            .reduce<MetaLookup>((agg, item) => ({ ...agg, [item.key]: item }), {}); 
          setGroups(metas);
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

  const addTag = (metaGroupKey: string, metaKey: string, tag: string) => {
    if (/^[a-z0-9][a-z0-9-]*$/.test(tag)) {
      /**
       * Standard tags are non-empty and use lowercase letters, digits and hyphens.
       * Finally, they cannot start with a hyphen.
       */
      worker.postMessage({
        key: 'update-level-meta',
        levelUid,
        metaGroupKey,
        update: { key: 'add-tag', tag, metaKey },
      });
      return true;
    } else if (tag === '-') {
      // Remove a single meta, possibly entire group
      worker.postMessage({ key: 'remove-level-meta', levelUid, metaGroupKey, metaKey });
      groups[metaGroupKey].metas.length === 1 && focusLevelKeys();
      return true;
    } else if (tag === '--') {
      // Remove an entire group
      worker.postMessage({ key: 'remove-level-meta', levelUid, metaGroupKey, metaKey: null });
      focusLevelKeys();
    } else if (/^>[a-z0-9][a-z0-9-]*$/.test(tag)) {
      // Given tag '>foo' draw NavPath to 1st meta with tag 'foo'
      const { position } = groups[metaGroupKey];
      const dstMeta = Object.values(groups)
        .find(({ metas }) => metas.some(meta => meta.tags.includes(tag.slice(1))));
      
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

  const removeTag = (metaGroupKey: string, metaKey: string, tag: string) => {
    worker.postMessage({ key: 'update-level-meta', levelUid, metaGroupKey, update: { key: 'remove-tag', tag, metaKey }});
  };

  const closeMetaGroup = (metaGroupKey: string) => {
    dispatch(Act.updateMetaUi(levelUid, metaGroupKey, { open: false }));
    focusLevelKeys();
  };

  const ensureMeta = (metaGroupKey: string, delta: -1 | 1) => {
    const group = groups[metaGroupKey];
    const metaIndex = delta === 1 ? group.metaIndex + 1 : posModulo(group.metaIndex - 1, group.metas.length);
    worker.postMessage({ key: 'update-level-meta', levelUid, metaGroupKey, update: { key: 'ensure-meta-index', metaIndex }});
  };

  return (
    <>
      <g className={css.metas}>
        {Object.values(groups).map(({ key: groupKey, position, metas, backupIcon }) =>
          <g key={groupKey}>
            {
              !groups[groupKey].hasIcon() && <LevelIcon position={position} icon={backupIcon} />
            }
            {metas.map(({ key, light, rect, trigger, physical, icon }) => (
              <g key={key}>
                {
                  // A meta can have a light
                  light && light.valid && (
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
                          theme === 'dark-mode' && (
                            <>
                              <stop offset="0%" style={{ stopColor: 'rgba(200, 200, 200, 0.3)' }} />
                              <stop offset="80%" style={{ stopColor: 'rgba(32, 32, 32, 0.1)' }} />
                              <stop offset="100%" style={{ stopColor: 'rgba(32, 32, 32, 0)' }} />
                            </>
                          ) || (
                            <>
                              <stop offset="0%" style={{ stopColor: 'rgba(0, 0, 0, 0.05)' }} />
                              <stop offset="100%" style={{ stopColor: 'rgba(0, 0, 0, 0.05)' }} />
                              <stop offset="100%" style={{ stopColor: 'rgba(0, 0, 0, 0)' }} />
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
                  )
                }
                {
                  // A meta can have a circular trigger
                  rect && trigger === 'circ' && !light && (
                    <circle
                      className={css.metaCirc}
                      cx={position.x}
                      cy={position.y}
                      r={rect.dimension}
                    />
                  )
                }
                {
                  // A meta can have a rectangular trigger
                  rect && trigger === 'rect' && (
                    <rect
                      className={css.metaRect}
                      x={rect.x}
                      y={rect.y}
                      width={rect.width}
                      height={rect.height}
                    />
                  )
                }
                {
                  // A meta can be a pickup
                  rect && physical === 'pickup' && (
                    <path
                      strokeWidth={0.1}
                      fill="#fff"
                      stroke="#000"
                      d={`M ${position.x},${position.y} l -1,-2 l 2,0 l -1,2`}
                    />
                  )
                }
                {
                  // A meta can be a door
                  rect && physical === 'door' && (
                    <rect
                      key={key}
                      strokeWidth={0}
                      stroke="rgba(100, 0, 0, 0.4)"
                      fill="none"
                      x={rect.x}
                      y={rect.y}
                      width={rect.width}
                      height={rect.height}
                    />
                  )
                }
                {
                  // A meta can have an icon
                  icon && <LevelIcon position={position} icon={icon} />
                }
              </g>
            ))}
            {
              // We indicate when a meta is being dragged
              draggedMeta && mouseWorld &&
                <g className={css.dragIndicator}>
                  <line
                    x1={draggedMeta.position.x}
                    y1={draggedMeta.position.y}
                    x2={mouseWorld.x}
                    y2={mouseWorld.y}
                  />
                  <circle
                    cx={mouseWorld.x}
                    cy={mouseWorld.y}
                    r={metaPointRadius}
                  />
                </g>
            }
          </g>
        )}
      </g>
      <g className={css.navPaths}>
        {
          // We may draw NavPaths while debugging/desiging
          Object.values(navPaths).map((navPath) =>
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
      {
        // Can show rectangular partition of navigable polygons
        showNavRects && (
          <g className={css.rects}>
            {rects.map(([x, y, width, height], i) => (
              <rect
                key={i}
                fill="none"
                stroke="rgba(200, 0, 0, 0.5)"
                strokeWidth={0.2}
                x={x}
                y={y}
                width={width}
                height={height}
              />
            ))}
          </g>
        )}
      {
      /**
       * The meta popovers (dialogs)
       */
        overlayRef.current && (
          ReactDOM.createPortal(
            Object.values(groups).map(({ key: groupKey, metas, metaIndex }) => (
              groupUi[groupKey] && groupUi[groupKey].open && (
                <section
                  key={groupKey}
                  className={css.metaPopover}
                  style={{
                    transform: `translate(${groupUi[groupKey].dialogPosition.x}px, ${groupUi[groupKey].dialogPosition.y}px) scale(0.25)`,
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
                  {metas
                    .filter((_, i) => i === metaIndex)
                    .map(({ key, tags }) => (
                      <section
                        key={groupKey} // We use groupKey to keep the input focused
                        className={css.content}
                        onClick={() => {
                          dispatch(Thunk.metaDialogToFront({ uid: levelUid, metaGroupKey: groupKey }));
                        }}
                      >
                        <input
                          tabIndex={-1} // Offscreen focus can break things
                          placeholder={`tags ${metaIndex +  1}/${metas.length}`}
                          onKeyPress={({ key: inputKey, currentTarget, currentTarget: { value } }) =>
                            inputKey === 'Enter' && addTag(groupKey, key, value) && (currentTarget.value = '')}
                          onKeyDown={({ key: inputKey }) =>
                            inputKey === 'Escape' && closeMetaGroup(groupKey)}
                          onKeyUp={(e) => {
                            e.stopPropagation();
                            e.key === 'ArrowDown' && ensureMeta(groupKey, +1);
                            e.key === 'ArrowUp' && ensureMeta(groupKey, -1);
                          }}
                        />
                        <section className={css.tags}>
                          {tags.map((tag) =>
                            <div
                              key={tag}
                              className={css.tag}
                              onClick={() => removeTag(groupKey, key, tag)}
                              title={tag}
                            >
                              {tag}
                            </div>
                          )}
                        </section>
                      </section>
                    ))}
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
