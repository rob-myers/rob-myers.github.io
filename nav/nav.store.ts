import { Subscription, Observable, ReplaySubject } from 'rxjs';
import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { Pathfinding } from 'three-pathfinding';

import { KeyedLookup, lookupFromValues } from '@model/generic.model';
import type { Rect } from '@model/geom/rect.model';
import { addToLookup, removeFromLookup, updateLookup } from '@store/store.util';
import { geomService } from '@model/geom/geom.service';
import { Polygon } from '@model/geom/geom.model';

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
    updateEnvNavigation: (envKey: string) => void;
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
          pathfinding: new Pathfinding(),
        }, env) }));
        get().api.setReady(envKey, false); // Not ready
      }
    },
    ensureRoom: (envKey, roomUid) => {
      !get().room[roomUid] &&
        set(({ room, env }) => ({
          room: addToLookup({ key: roomUid, envKey, navRects: [] }, room),
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

    updateEnvNavigation: (envKey) => {
      const navRects = get().env[envKey].roomUids.flatMap(uid => get().room[uid].navRects);
      const navPolys = geomService.union(navRects.map(r => Polygon.fromRect(r)));
      // console.log('navRects, navPolys', navRects, navPolys);
      
      const navMesh = geomService.meshFromPolys(navPolys, 'XZ');
      const pathfinding = new Pathfinding();
      pathfinding.setZoneData('zone1', Pathfinding.createZone(navMesh.geometry as THREE.BufferGeometry));
      // console.log('navMesh, pathfinding', navMesh, pathfinding);

      set(({ env }) => ({ env: updateLookup(envKey, env, () => ({ pathfinding })) }));
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
  pathfinding: Pathfinding;
}

interface RoomItem {
  /** Room uid from room mesh */
  key: string;
  envKey: string;
  navRects: Rect[];
}

export default useStore;
