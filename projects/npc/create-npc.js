import { Poly, Vect } from '../geom';
import { animScaleFactor } from "../service/npc";

// TODO modularise
import npcJson from '../../public/npc/first-npc.json'

/**
 * @param {string} npcKey 
 * @param {Geom.VectJson} at 
 * @param {{ disabled?: boolean; panZoomApi: PanZoom.CssApi; npcs: NPC.FullApi; }} deps
 */
 export default function createNpc(
  npcKey,
  at,
  { disabled, panZoomApi, npcs },
) {
  /** @type {NPC.NPC} */
  const npc = {
    key: npcKey,
    spawnedAt: Date.now(),
    // TODO hook up angle
    def: { key: npcKey, position: at, angle: 0, paused: !!disabled },
    el: {
      root: /** @type {HTMLDivElement} */ ({}),
      body: /** @type {HTMLDivElement} */ ({}),
    },
    anim: {
      animPath: [],
      aux: { angs: [], count: 0, edges: [], elens: [], navPathPolys: [], sofars: [], total: 0 },
      origPath: [],
      spriteSheet: 'idle',
      root: new Animation,
      body: new Animation,
      wayMetas: [],
    },

    get paused() {
      return this.anim.root.playState === 'paused';
    },
    async cancel() {
      console.log(`cancel: cancelling ${this.def.key}`);
      const { anim } = this;
      // Commit position and rotation
      anim.root.commitStyles();
      await/** @type {Promise<void>} */ (new Promise(resolve => {
        anim.root.addEventListener('cancel', () => resolve());
        anim.root.cancel();
        anim.body.cancel();
      }));
    },
    pause() {
      console.log(`pause: pausing ${this.def.key}`);
      const { anim } = this;
      anim.root.pause();
      anim.body.pause();
      anim.root.commitStyles();
    },
    play() {
      console.log(`play: resuming ${this.def.key}`);
      const { anim } = this;
      anim.root.play();
      anim.body.play();
    },

    async followNavPath(path, opts) {
      const { anim } = this;
      anim.origPath = path.map(Vect.from);
      anim.animPath = npc.anim.origPath.slice();
      this.updateAnimAux();
      if (anim.animPath.length <= 1 || anim.aux.total === 0) {
        return;
      }
      
      if (opts?.enterIndexes) {
        anim.wayMetas = opts.enterIndexes.flatMap(i => [
          { key: 'enter-door', length: anim.aux.sofars[i]},
          { key: 'exit-door', length: anim.aux.sofars[i + 1]},
        ]);

        const items = anim.wayMetas.slice();
        const animEventCb = () => {
          if (items.length === 0) {
            npcs.loop.remove(animEventCb);
          } else if (npc.anim.spriteSheet === 'walk' && anim.root.playState === 'running') {
            if (/** @type {number} */ (anim.root.currentTime) > items[0].length * animScaleFactor) {
              // TODO send event 🚧
              console.log(items.shift());
            }
          }
        };
        npcs.loop.updates.push(animEventCb);
      }

      console.log(`followNavPath: ${this.def.key} started walk`);
      this.setSpritesheet('walk');
      this.startAnimation();

      await /** @type {Promise<void>} */ (new Promise((resolve, reject) => {
        anim.root.addEventListener("finish", () => {
          // We don't cancel, so we don't pass control back to styles
          console.log(`followNavPath: ${this.def.key} finished walk`);
          resolve();
        });
        anim.root.addEventListener("cancel", () => {
          // Cancel only when _actually_ cancelled, not when finished
          console.log(`followNavPath: ${this.def.key} cancelled walk`);
          reject(new Error('cancelled'));
        });
      }));

      // TODO what about when cancel walk?
      this.setSpritesheet('idle');
      this.startAnimation();
    },
    getAngle() {
      const matrix = new DOMMatrixReadOnly(window.getComputedStyle(this.el.root).transform);
      return Math.atan2(matrix.m12, matrix.m11);
    },
    getAnimDef() {
      // NOTE Web Animations polyfill may require ≥ 2 frames
      const { anim } = this, { aux } = anim;
      return {
        keyframes: anim.animPath.flatMap((p, i) => [
          {
            offset: aux.sofars[i] / aux.total,
            transform: `translate(${p.x}px, ${p.y}px) rotateZ(${aux.angs[i - 1] || aux.angs[i] || 0}rad)`
          },
          {
            offset: aux.sofars[i] / aux.total,
            transform: `translate(${p.x}px, ${p.y}px) rotateZ(${aux.angs[i] || aux.angs[i - 1] || 0}rad)`
          },
        ]),
        opts: { duration: aux.total * animScaleFactor, direction: 'normal', fill: 'forwards' },
      };
    },
    getPosition() {
      const { x: clientX, y: clientY } = Vect.from(this.el.root.getBoundingClientRect());
      return Vect.from(panZoomApi.getWorld({ clientX, clientY })).precision(2);
    },
    getTargets() {
      const { anim } = this;
      if (anim.spriteSheet === "idle" || anim.root.currentTime === null) {
        return [{ point: this.getPosition(), arriveMs: 0 }];
      } else {
        const soFarMs = anim.root.currentTime;

        return anim.aux.sofars
          .map((sofar, i) => ({ point: anim.animPath[i], arriveMs: (sofar * animScaleFactor) - soFarMs }))
          .filter((x, i) => x.arriveMs >= 0 || i === anim.animPath.length - 1)
      }
    },
    setSpritesheet(spriteSheet) {
      if (spriteSheet !== this.anim.spriteSheet) {
        this.el.root.classList.remove(this.anim.spriteSheet);
        this.el.root.classList.add(spriteSheet);
        this.anim.spriteSheet = spriteSheet;
      }
    },
    startAnimation() {
      const { anim } = this;
      anim.aux.count++;

      if (anim.spriteSheet === 'walk') {
        // Animate position and rotation
        const { keyframes, opts } = this.getAnimDef();
        // TODO 🚧 wrap animation with events, and own interface e.g. pause/play
        const kfe = new KeyframeEffect(this.el.root, keyframes, opts);
        anim.root = new Animation(kfe, document.timeline);
        anim.root.play();

        // Animate spritesheet
        const { animLookup, zoom: animZoom } = npcJson;
        anim.body = this.el.body.animate([
          { offset: 0, backgroundPosition: '0px' },
          { offset: 1, backgroundPosition: `${-animLookup.walk.frames.length * animLookup.walk.aabb.width * animZoom}px` },
        ], { easing: `steps(${animLookup.walk.frames.length})`, duration: 0.625 * 1000, iterations: Infinity });

      } else if (anim.spriteSheet === 'idle') {
        anim.root = this.el.root.animate([], { duration: 2 * 1000, iterations: Infinity });
        // TODO induced by animLookup
        anim.body = this.el.body.animate([], { duration: 2 * 1000, iterations: Infinity });
      }
    },
    updateAnimAux() {
      const { anim } = this, {  aux } = anim;
      aux.edges = anim.animPath.map((p, i) => ({ p, q: anim.animPath[i + 1] })).slice(0, -1);
      aux.angs = aux.edges.map(e => Number(Math.atan2(e.q.y - e.p.y, e.q.x - e.p.x).toFixed(2)));
      aux.elens = aux.edges.map(({ p, q }) => Number(p.distanceTo(q).toFixed(2)));
      aux.navPathPolys = aux.edges.map(e => {
        const normal = e.q.clone().sub(e.p).rotate(Math.PI/2).normalize(0.01);
        return new Poly([e.p.clone().add(normal), e.q.clone().add(normal), e.q.clone().sub(normal), e.p.clone().sub(normal)]);
      });
      const reduced = aux.elens.reduce((agg, length) => {
        agg.total += length;
        agg.sofars.push(agg.sofars[agg.sofars.length - 1] + length);
        return agg;
      }, { sofars: [0], total: 0 });
      aux.sofars = reduced.sofars
      aux.total = reduced.total;
      anim.wayMetas = [];
    },

  };
  return npc;
}
