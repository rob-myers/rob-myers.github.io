import { Rect } from '../geom';

/** @param {{ item: NPC.DecorDef }} props  */
export default function Decor({ item }) {
  /** @type {Geom.Rect} */ let aabb;
  /** @type {React.ReactNode} */ let child;

  switch (item.type) {
    case 'path':
      aabb = Rect.fromPoints(...item.path).outset(10);
      child = (
        <g className="debug-path">
          <polyline
            fill="none" stroke="#88f" strokeDasharray="2 2" strokeWidth={1}
            points={item.path.map(p => `${p.x},${p.y}`).join(' ')}
          />
          {item.path.map((p, i) => (
            <circle key={i} fill="none" stroke="#ff444488" r={2} cx={p.x} cy={p.y} />
          ))}
        </g>
      );
      break;
    case 'circle':
      aabb = new Rect(item.center.x - item.radius, item.center.y - item.radius, item.radius * 2, item.radius * 2);
      child = (
        <circle
          className="debug-circle"
          cx={item.center.x}
          cy={item.center.y}
          r={item.radius}
        />
      );
      break;
    default:
      console.error(`unexpected decor`, item);
      // throw testNever(item);
      return null;
  }

  return (
    <svg width={aabb.width} height={aabb.height} style={{ left: aabb.x, top: aabb.y }}>
      <g style={{ transform: `translate(${-aabb.x}px, ${-aabb.y}px)` }}>
        {child}
      </g>
    </svg>
  );
}
