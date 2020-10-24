/**
 * Message from terminal to 'world',
 * e.g. do something in the world.
 */
export type MessageToWorld = (
  | DummyAction
);

export interface DummyAction {
  key: 'dummy-action';
}


/**
 * Message from world,
 * e.g. the world was clicked
 */
export type MessageFromWorld = (
  | Click // Click
);


export interface Click {
  key: 'click';
  meta: string;
  x: number;
  y: number;
}

export type WorldDeviceCallback = (err: null | string) => void;

export function handleWorldDeviceWrites(envKey: string) {
  return (msg: MessageToWorld) => {
    console.log('worldDevice was written to', msg);

    switch (msg.key) {
      case 'dummy-action': {
        // NOOP
        break;
      }
    }
  };
}
