import { Subject } from "rxjs";

/** @type {{ [wireKey: string]: Subject<NPC.WireMessage> }} */
const wire = {};

export function ensureWire(wireKey = 'default-wire') {
  return (
    wire[wireKey]
    || (wire[wireKey] = new Subject)
  );
}
