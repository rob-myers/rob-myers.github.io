import { Subscription, Observable, ReplaySubject } from 'rxjs';
import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { KeyedLookup, lookupFromValues } from '@model/generic.model';
import type { Rect } from '@model/geom/rect.model';
import Mesh from "@model/polyanya/structs/mesh";
import { rectsToPolyanya } from '@model/geom/polyanya.model';
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
    setReady: (evnKey: string, ready: boolean) => void;
    updatePolyanyaMeshes: (envKey: string) => void;
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
          roomUids: [],
          navReady$: new ReplaySubject(1),
          navUpdatesSub: o.subscribe(),
          polyanyaMesh: new Mesh({ vertices: [], polygons: [], vertexToPolys: [] }),
        }, env) }));
        get().api.setReady(envKey, false); // Not ready
      }
    },
    ensureRoom: (envKey, roomUid) => {
      !get().room[roomUid] &&
        set(({ room, env }) => ({
          room: addToLookup({ key: roomUid, envKey, navPartitions: [] }, room),
          env: updateLookup(envKey, env, ({ roomUids }) => ({ roomUids: roomUids.concat(roomUid) })),
        }));
    },
    removeEnv: (envKey) => {
      get().env[envKey]?.navUpdatesSub.unsubscribe();
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
        })),
      }));
      get().api.setReady(envKey, false);
    },
    setReady: (envKey, ready: boolean) => {
      get().env[envKey].navReady$.next(ready);
    },
    updatePolyanyaMeshes: (envKey) => {
      // Can flatten navPartitions because polyanya Mesh supports disjoint areas
      const navRects = get().env[envKey].roomUids.reduce((agg, roomUid) =>
        agg.concat(...get().room[roomUid].navPartitions), [] as Rect[]);

      // console.log('Polyanya will use navRects', navRects);
      set(({ env }) => ({
        env: updateLookup(envKey, env, () => ({ polyanyaMesh: new Mesh(rectsToPolyanya(navRects)) })),
      }));
      // console.log('Computed polyanya mesh', get().env[envKey].polyanyaMesh);
      get().api.setReady(envKey, true);
    },
    updateRoom: (def) => {
      set(({ room }) => ({ room: updateLookup(def.key, room, () => def) }));
      get().api.setReady(def.envKey, false);
    },
  },
})));

interface EnvItem {
  key: string;
  /** Keys of `RoomItem`s */
  roomUids: string[];
  /** Track readiness */
  navReady$: ReplaySubject<boolean>;
  /** For debounced nav updates */
  navUpdatesSub: Subscription;
  /** Polyanya representation of all nav partitions */
  polyanyaMesh: Mesh;
}

interface RoomItem {
  /** Room uid from room mesh */
  key: string;
  envKey: string;
  /**
   * A room might have disjoint parts, so there
   * may be multiple rectangular decompositions.
   * However, we flatten this array for polyanya.
   */
  navPartitions: Rect[][];
}

export default useStore;
