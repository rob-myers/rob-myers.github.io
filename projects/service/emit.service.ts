import { Subject } from "rxjs";

const wire = {} as {
  [wireKey: string]: Subject<
    | NPC.NpcEvent
    | NPC.PointerEvent
  >;
};

export function ensureWire(wireKey = 'default-wire') {
  return (
    wire[wireKey]
    || (wire[wireKey] = new Subject)
  );
}
