import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LevelState } from '@model/level/level.model';
import { LevelMetaGroup } from '@model/level/level-meta.model';
import { subscribeToWorker } from '@model/level/level.worker.model';
import { NavPath } from '@model/level/nav/nav-path.model';
import { KeyedLookup, mapValues } from '@model/generic.model';
import { addToLookup } from '@model/redux.model';
import { Rect2Json } from '@model/rect2.model';
import { metaPointRadius } from '@model/level/level-params';
import { Act } from '@store/level.duck';
import css from './level.scss';
import { LevelIcon } from './level-icon';

type MetaLookup = LevelState['metaGroups'];

const LevelMetas: React.FC<Props> = ({ levelUid }) => {

  const draggedMeta = useSelector(({ level: { instance: { [levelUid]: level } } }) =>
    level.draggedMeta ? level.metaGroupUi[level.draggedMeta] : null);
  const toGroupUi = useSelector(({ level: { instance } }) => instance[levelUid]?.metaGroupUi);
  const mode = useSelector(({ level: { instance } }) => instance[levelUid]?.mode);
  const mouseWorld = useSelector(({ level: { instance } }) => draggedMeta && instance[levelUid]?.mouseWorld);
  const showNavRects = useSelector(({ level: { instance } }) => instance[levelUid].showNavRects);
  const theme = useSelector(({ level: { instance } }) => instance[levelUid].theme);
  const worker = useSelector(({ level: { worker } }) => worker)!;
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
          dispatch(Act.syncMetaUi(levelUid, metas));
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

  return (
    <>
      {
        // Can show rectangular partition of navigable polygons
        showNavRects && (
          <g className={css.rects}>
            {rects.map(([x, y, width, height], i) => (
              <rect
                key={i}
                fill="none"
                // stroke="rgba(140, 0, 0, 1)"
                stroke="rgba(60, 60, 60, 1)"
                strokeWidth={0.25}
                x={x}
                y={y}
                width={width}
                height={height}
              />
            ))}
          </g>
        )
      }
      {
        // Can draw NavPaths while debugging/designing
        <g className={css.navPaths}>
          {
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
      }
      <g className={css.metas}>
        {Object.values(groups).map(({ key: groupKey, position, metas, backupIcon }) =>
          <g key={groupKey}>
            {
              !groups[groupKey].hasIcon() && (
                mode === 'live' && !groups[groupKey].hideWhenLive() && (
                  <LevelIcon
                    position={position}
                    highlight={toGroupUi[groupKey]?.open}
                  />
                ) || mode === 'edit' && (
                  <LevelIcon
                    position={position}
                    icon={backupIcon}
                    highlight={toGroupUi[groupKey]?.open}
                  />
                )
              )
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
                              <stop offset="0%" style={{ stopColor: 'rgba(200, 200, 200, 0.15)' }} />
                              <stop offset="90%" style={{ stopColor: 'rgba(200, 200, 200, 0.1)' }} />
                              <stop offset="100%" style={{ stopColor: 'rgba(200, 200, 200, 0)' }} />
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
                  rect && (
                    // A meta can have a circular trigger
                    trigger === 'circ' && (
                      <circle
                        className={css.metaCirc}
                        cx={position.x}
                        cy={position.y}
                        r={rect.dimension}
                      />
                    ) || (
                      // A meta can have a rectangular trigger
                      trigger === 'rect' && (
                        <rect
                          className={css.metaRect}
                          x={rect.x}
                          y={rect.y}
                          width={rect.width}
                          height={rect.height}
                        />
                      )
                    ) || (
                      // A meta can be a table
                      physical === 'table' && (
                        <rect
                          className={css.metaTable}
                          x={rect.x}
                          y={rect.y}
                          width={rect.width}
                          height={rect.height}
                          filter="url(#svg-filter-shadow)"
                        />
                      )
                    ) || (
                      // A meta can be a door
                      physical === 'way' && (
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
                    )
                  )
                }
                {
                  // A meta can have an icon
                  icon &&
                    <LevelIcon
                      position={position}
                      icon={icon}
                      highlight={toGroupUi[groupKey]?.open}
                    />
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
    </>
  );
};

interface Props {
  levelUid: string;
}

export default LevelMetas;
