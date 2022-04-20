import { Subject } from "rxjs";

/** @type {{ [wireKey: string]: Subject<NPC.NpcEvent | NPC.PointerEvent> }} */
const wire = {};

export function ensureWire(wireKey = 'default-wire') {
  return (
    wire[wireKey]
    || (wire[wireKey] = new Subject)
  );
}
