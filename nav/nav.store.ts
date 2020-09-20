import { Subscription, Observable } from 'rxjs';
import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { KeyedLookup, lookupFromValues } from '@model/generic.model';
import { Rect } from '@model/geom/rect.model';
import { addToLookup, removeFromLookup, updateLookup } from '@store/store.util';

const useStore = create<{
  env: KeyedLookup<EnvItem>;
  room: KeyedLookup<RoomItem>;
  api: {
    ensureEnv: (envKey: string, o: Observable<any>) => void;
    /** Ensure room and parent env */
    ensureRoom: (envKey: string, roomUid: string) => void;
    removeEnv: (envKey: string) => void;
    removeRoom: (envKey: string, roomUid: string) => void;
    updateRoom: (roomItem: RoomItem) => void;
  },
}>(devtools((set, get) => ({
  env: {},
  room: {},
  api: {
    ensureEnv: (envKey, o) => {
      if (!get().env[envKey]) {
        set(({ env }) => ({ env: addToLookup({
          key: envKey,
          ready: false,
          roomUids: [],
          subscription: o.subscribe(),
        }, env) }));
      }
    },
    ensureRoom: (envKey, roomUid) => {
      !get().room[roomUid] &&
        set(({ room }) => ({ room: addToLookup({ key: roomUid, envKey, navPartitions: [] }, room) }));
    },
    removeEnv: (envKey) => {
      get().env[envKey]?.subscription.unsubscribe();
      set(({ env, room }) => ({
        env: removeFromLookup(envKey, env),
        room: lookupFromValues(Object.values(room).filter(x => x.envKey !== envKey)),
      }));
    },
    removeRoom: (envKey, roomUid) => {
      set(({ env, room }) => ({
        room: removeFromLookup(roomUid, room),
        env: updateLookup(envKey, env, ({ roomUids }) => ({
          roomUids: roomUids.filter(x => x !== roomUid),
          ready: false,
        })),
      }));
    },
    updateRoom: (def) => {
      set(({ room, env }) => ({
        room: updateLookup(def.key, room, () => def),
        env: updateLookup(def.envKey, env, () => ({ ready: false })),
      }));
    },
  },
})));

interface EnvItem {
  key: string;
  roomUids: string[];
  /** Ready for navpath queries? */
  ready: boolean;
  /** For debouncing nav updates */
  subscription: Subscription;
}

interface RoomItem {
  /** Room uid from room mesh */
  key: string;
  envKey: string;
  navPartitions: Rect[][];
}

export default useStore;
