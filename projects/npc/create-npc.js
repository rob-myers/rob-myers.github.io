import { Poly, Rect, Vect } from '../geom';

/**
 * TODO modularise
 */
import npcJson from '../../public/npc/first-npc.json'

/**
 * @param {string} npcKey 
 * @param {Geom.VectJson} position 
 * @param {{ disabled?: boolean; panZoomApi: PanZoom.CssApi; npcs: NPC.FullApi; }} deps
 * @returns {NPC.NPC}
 */
 export default function createNpc(
  npcKey,
  position,
  { disabled, panZoomApi, npcs },
) {
  return {
    key: npcKey,
    epochMs: Date.now(),
    // TODO hook up angle
    def: { key: npcKey, position, angle: 0, paused: !!disabled },
    el: {
      root: /** @type {HTMLDivElement} */ ({}),
      body: /** @type {HTMLDivElement} */ ({}),
    },
    anim: {
      animPath: [],
      aux: { angs: [], count: 0, edges: [], elens: [], navPathPolys: [], sofars: [], total: 0 },
      spriteSheet: 'idle',
      root: new Animation,
      body: new Animation,
      wayMetas: [],
      wayTimeoutId: 0,
    },

    get paused() {
      return this.anim.root.playState === 'paused';
    },
    async cancel() {
      console.log(`cancel: cancelling ${this.def.key}`);

      const { anim } = this;
      anim.root.commitStyles(); // Commit position and rotation
      anim.wayMetas.length = 0;

      await/** @type {Promise<void>} */ (new Promise(resolve => {
        anim.root.addEventListener('cancel', () => resolve());
        anim.root.cancel();
      }));
    },
    pause() {
      console.log(`pause: pausing ${this.def.key}`);
      const { anim } = this;
      anim.root.pause();
      anim.body.pause();
      anim.root.commitStyles();
      window.clearTimeout(anim.wayTimeoutId);
    },
    play() {
      console.log(`play: resuming ${this.def.key}`);
      const { anim } = this;
      anim.root.play();
      anim.body.play();
      this.nextWayTimeout();
    },
    nextWayTimeout() {
      const { anim } = this;
      if (anim.root.currentTime === null) {
        return console.warn('nextWayTimeout: anim.root.currentTime is null')
      }
      if (anim.wayMetas[0]) {
        anim.wayTimeoutId = window.setTimeout(
          this.wayTimeout.bind(this),
          (anim.wayMetas[0].length * animScaleFactor) - anim.root.currentTime,
        );
      }
    },
    /**
     * TODO cleanup
     */
    wayTimeout() {
      const { anim } = this;
      // TODO avoid many short timeouts
      // console.log('anim.wayMetas[0]', anim.wayMetas[0]);
      if (
        anim.wayMetas.length === 0
        || anim.spriteSheet === 'idle'
        || anim.root.currentTime === null
        || anim.root.playState === 'paused'
      ) {
        if (anim.wayMetas.length === 0) console.warn('wayTimeout: empty anim.wayMetas');
        if (anim.root.currentTime === null) console.warn('wayTimeout: anim.root.currentTime is null');
        if (anim.spriteSheet === 'idle') console.warn('wayTimeout: anim.spriteSheet is "idle"');
        return;
      } else if (anim.root.currentTime >= (anim.wayMetas[0].length * animScaleFactor) - 1) {
        const wayMeta = /** @type { NPC.WayPointMeta} */ (anim.wayMetas.shift());
        console.log(wayMeta); // DEBUG
        npcs.events.next({ key: 'way-point', npcKey: this.def.key, meta: wayMeta });
      }
      this.nextWayTimeout();
    },

    async followNavPath(path, opts) {
      const { anim } = this;
      anim.animPath = path.map(Vect.from);
      anim.wayMetas.length = 0;
      this.updateAnimAux();
      if (anim.animPath.length <= 1 || anim.aux.total === 0) {
        return;
      }
            
      if (opts?.globalNavMetas) {
        anim.wayMetas = opts.globalNavMetas.map((navMeta) => ({
          ...navMeta,
          length: navMeta.key === 'pre-exit-room'
            ? Math.max(anim.aux.sofars[navMeta.index] - (npcRadius + 5), 0)
            // Slightly early to ensure it is triggered
            : Math.max(anim.aux.sofars[navMeta.index] - 0.1, 0)
        }));
      }

      this.setSpritesheet('walk');
      this.startAnimation();
      npcs.events.next({ key: 'started-walking', npcKey: this.def.key });
      console.log(`followNavPath: ${this.def.key} started walk`);
      this.nextWayTimeout();

      try {
        await /** @type {Promise<void>} */ (new Promise((resolve, reject) => {
          anim.root.addEventListener("finish", () => {
            // We don't cancel, so we don't pass control back to styles
            console.log(`followNavPath: ${this.def.key} finished walk`);
            resolve();
          });
          anim.root.addEventListener("cancel", () => {
            if (!anim.root.finished) {
              console.log(`followNavPath: ${this.def.key} cancelled walk`);
            } // We also cancel when finished to release control to styles
            reject(new Error('cancelled'));
          });
        }));
      } finally {
        this.setSpritesheet('idle');
        this.startAnimation();
        npcs.events.next({ key: 'stopped-walking', npcKey: this.def.key });
      }

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
    getBounds() {
      const center = this.getPosition();
      return new Rect(center.x - npcRadius, center.y - npcRadius, 2 * npcRadius, 2 * npcRadius);
    },
    getPosition() {
      const { x: clientX, y: clientY } = Vect.from(this.el.root.getBoundingClientRect());
      return Vect.from(panZoomApi.getWorld({ clientX, clientY })).precision(2);
    },
    getTargets() {
      const { anim } = this;
      if (anim.spriteSheet === "idle" || anim.root.currentTime === null) {
        return [];
      } else {
        const soFarMs = anim.root.currentTime;
        return anim.aux.sofars
          .map((sofar, i) => ({ point: anim.animPath[i], arriveMs: (sofar * animScaleFactor) - soFarMs }))
          .filter(x => x.arriveMs >= 0)
      }
    },
    lookAt(point) {
      /**
       * TODO
       */
      console.log({
        lookAt: point,
      })
      return 0;
    },
    npcRef(rootEl) {
      if (rootEl && this.anim.aux.count === 0) {
        this.el.root = rootEl;
        this.el.body = /** @type {HTMLDivElement} */ (rootEl.childNodes[0]);
        this.el.root.style.transform = `translate(${this.def.position.x}px, ${this.def.position.y}px)`;
        this.el.body.style.transform = `scale(${npcScale}) rotate(${npcOffsetAngleDeg}deg)`;
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
      if (anim.aux.count) {
        anim.root.commitStyles();
        anim.root.cancel();
      }

      if (anim.spriteSheet === 'walk') {
        // Animate position and rotation
        const { keyframes, opts } = this.getAnimDef();
        anim.root = this.el.root.animate(keyframes, opts);
        // anim.root.play();

        // Animate spritesheet
        const { animLookup, zoom: animZoom } = npcJson;
        anim.body = this.el.body.animate([
          { offset: 0, backgroundPosition: '0px' },
          { offset: 1, backgroundPosition: `${-animLookup.walk.frameCount * animLookup.walk.aabb.width * animZoom}px` },
        ], { easing: `steps(${animLookup.walk.frameCount})`, duration: 0.625 * 1000, iterations: Infinity });

      } else if (anim.spriteSheet === 'idle') {
        anim.wayMetas.length = 0;

        anim.root = this.el.root.animate([], { duration: 2 * 1000, iterations: Infinity });
        // TODO induced by animLookup
        anim.body = this.el.body.animate([], { duration: 2 * 1000, iterations: Infinity });
      }

      anim.aux.count++;
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
    },
  };
}

/**
 * Scale factor we'll apply to sprites.
 * Beware that sprites may themselves be scaled up,
 * see `zoom` in npc json
 */
const npcScale = 0.2;
const npcOrigRadius = 40;
/** Ensure NPC faces along positive x-axis */
const npcOffsetAngleDeg = 0;

export const npcRadius = npcOrigRadius * npcScale * npcJson.zoom;

/** Scale up how long it should take to move along navpath */
export const animScaleFactor = 15;
