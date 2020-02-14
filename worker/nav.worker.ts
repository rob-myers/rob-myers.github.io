import { Poly2 } from '@model/poly2.model';
const foo = new Poly2();
console.log({ foo });

const ctxt: Worker = self as any;

// Post data to parent thread
ctxt.postMessage({ fromWorker: 'fromWorker' });
// Respond to message from parent thread
ctxt.addEventListener('message', (event) => console.log({ receivedFromHost: event }));
