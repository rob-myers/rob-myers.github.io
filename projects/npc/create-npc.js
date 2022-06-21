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
    // TODO hook up initial angle
    def: { key: npcKey, position, angle: 0, paused: !!disabled },
    el: {
      root: /** @type {HTMLDivElement} */ ({}),
      body: /** @type {HTMLDivElement} */ ({}),
    },
    anim: {
      animPath: [],
      aux: { angs: [], count: 0, edges: [], elens: [], navPathPolys: [], sofars: [], total: 0 },

      spriteSheet: 'idle',

      translate: new Animation,
      rotate: new Animation,
      sprites: new Animation,

      wayMetas: [],
      wayTimeoutId: 0,
      lookAngle: 0,
    },
    indicators: false,

    async cancel() {
      console.log(`cancel: cancelling ${this.def.key}`);

      const { anim } = this;
      anim.translate.commitStyles(); // Commit position and rotation
      anim.rotate.commitStyles();
      anim.wayMetas.length = 0;

      await/** @type {Promise<void>} */ (new Promise(resolve => {
        anim.translate.addEventListener('cancel', () => resolve());
        anim.translate.cancel();
        anim.rotate.cancel();
      }));
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
          anim.translate.addEventListener("finish", () => {
            // We don't cancel, so we don't pass control back to styles
            console.log(`followNavPath: ${this.def.key} finished walk`);
            resolve();
          });
          anim.translate.addEventListener("cancel", () => {
            if (!anim.translate.finished) {
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
      const matrix = new DOMMatrixReadOnly(window.getComputedStyle(this.el.body).transform);
      return Math.atan2(matrix.m12, matrix.m11);
    },
    getAnimDef() {
      const { anim, anim: { aux } } = this;
      return {
        translateKeyframes: anim.animPath.flatMap((p, i) => [
          { offset: aux.sofars[i] / aux.total, transform: `translate(${p.x}px, ${p.y}px)` },
          { offset: aux.sofars[i] / aux.total, transform: `translate(${p.x}px, ${p.y}px)` },
        ]),
        rotateKeyframes: anim.animPath.flatMap((p, i) => [
          {
            offset: aux.sofars[i] / aux.total,
            transform: `rotateZ(${aux.angs[i - 1] || aux.angs[i] || 0}rad) scale(${npcScale})`
          },
          {
            offset: aux.sofars[i] / aux.total,
            transform: `rotateZ(${aux.angs[i] || aux.angs[i - 1] || 0}rad) scale(${npcScale})`
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
      // TODO avoid getBoundingClientRect undefined
      const { x: clientX, y: clientY } = Vect.from(this.el.root.getBoundingClientRect?.() || [0, 0]);
      return Vect.from(panZoomApi.getWorld({ clientX, clientY })).precision(2);
    },
    getTargets() {
      const { anim } = this;
      if (anim.spriteSheet === "idle" || anim.translate.currentTime === null) {
        return [];
      } else {
        const soFarMs = anim.translate.currentTime;
        return anim.aux.sofars
          .map((sofar, i) => ({ point: anim.animPath[i], arriveMs: (sofar * animScaleFactor) - soFarMs }))
          .filter(x => x.arriveMs >= 0)
      }
    },
    lookAt(point) {
      const position = this.getPosition();
      const direction = Vect.from(point).sub(position);
      if (direction.length === 0) {
        return this.getAngle();
      }

      // Ensure we don't turn more than 180 deg
      let radians = Math.atan2(direction.y, direction.x);
      while (radians - this.anim.lookAngle > Math.PI) radians -= 2 * Math.PI;
      while (this.anim.lookAngle - radians > Math.PI) radians += 2 * Math.PI;
      this.anim.lookAngle = radians;

      // Only works when idle, otherwise overridden/overwritten
      this.el.body.style.transform = `rotate(${npcOffsetRadians + radians}rad) scale(${npcScale})`;
      return radians;
    },
    nextWayTimeout() {
      const { anim } = this;
      if (anim.translate.currentTime === null) {
        return console.warn('nextWayTimeout: anim.root.currentTime is null')
      }
      if (anim.wayMetas[0]) {
        anim.wayTimeoutId = window.setTimeout(
          this.wayTimeout.bind(this),
          (anim.wayMetas[0].length * animScaleFactor) - anim.translate.currentTime,
        );
      }
    },
    npcRef(rootEl) {
      if (rootEl && this.anim.aux.count === 0) {
        this.el.root = rootEl;
        this.el.body = /** @type {HTMLDivElement} */ (rootEl.childNodes[0]);
        this.el.root.style.transform = `translate(${this.def.position.x}px, ${this.def.position.y}px)`;
        this.el.body.style.transform = `rotate(${npcOffsetRadians}rad) scale(${npcScale})`;
      }
    },
    pause() {
      console.log(`pause: pausing ${this.def.key}`);
      const { anim } = this;
      anim.translate.pause();
      anim.rotate.pause();
      anim.sprites.pause();
      anim.translate.commitStyles();
      anim.rotate.commitStyles();
      window.clearTimeout(anim.wayTimeoutId);
    },
    get paused() {
      return this.anim.translate.playState === 'paused';
    },
    play() {
      console.log(`play: resuming ${this.def.key}`);
      const { anim } = this;
      anim.translate.play();
      anim.rotate.play();
      anim.sprites.play();
      this.nextWayTimeout();
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
        anim.translate.commitStyles();
        anim.rotate.commitStyles();
        anim.translate.cancel();
        anim.rotate.cancel();
      }

      if (anim.spriteSheet === 'walk') {
        // Animate position and rotation
        const { translateKeyframes, rotateKeyframes, opts } = this.getAnimDef();
        anim.translate = this.el.root.animate(translateKeyframes, opts);
        anim.rotate = this.el.body.animate(rotateKeyframes, opts);

        // Animate spritesheet
        const { animLookup, zoom: animZoom } = npcJson;
        anim.sprites = this.el.body.animate([
          { offset: 0, backgroundPosition: '0px' },
          { offset: 1, backgroundPosition: `${-animLookup.walk.frameCount * animLookup.walk.aabb.width * animZoom}px` },
        ], { easing: `steps(${animLookup.walk.frameCount})`, duration: 0.625 * 1000, iterations: Infinity });

      } else if (anim.spriteSheet === 'idle') {
        anim.wayMetas.length = 0;
        anim.lookAngle = this.getAngle();

        // Below needed?
        anim.translate = this.el.root.animate([], { duration: 2 * 1000, iterations: Infinity });
        anim.rotate = this.el.body.animate([], { duration: 2 * 1000, iterations: Infinity });
        anim.sprites = this.el.body.animate([], { duration: 2 * 1000, iterations: Infinity });
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
        || anim.translate.currentTime === null
        || anim.translate.playState === 'paused'
      ) {
        if (anim.wayMetas.length === 0) console.warn('wayTimeout: empty anim.wayMetas');
        if (anim.translate.currentTime === null) console.warn('wayTimeout: anim.root.currentTime is null');
        if (anim.spriteSheet === 'idle') console.warn('wayTimeout: anim.spriteSheet is "idle"');
        return;
      } else if (anim.translate.currentTime >= (anim.wayMetas[0].length * animScaleFactor) - 1) {
        const wayMeta = /** @type { NPC.WayPointMeta} */ (anim.wayMetas.shift());
        console.log(wayMeta); // DEBUG
        npcs.events.next({ key: 'way-point', npcKey: this.def.key, meta: wayMeta });
      }
      this.nextWayTimeout();
    },
  };
}

/**
 * Scale factor we'll apply to sprites.
 * Beware that sprites may themselves be scaled up,
 * see `zoom` in npc json
 */
const npcScale = 0.19;
const npcOrigRadius = 40;
/** Ensure NPC faces along positive x-axis */
const npcOffsetRadians = 0;

export const npcRadius = npcOrigRadius * npcScale * npcJson.zoom;

export const npcInteractRadius = npcRadius * 2;

/** Scale up how long it should take to move along navpath */
export const animScaleFactor = 15;
