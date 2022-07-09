import { Poly, Rect, Vect } from '../geom';
import { cssName } from '../service/const';
import { getNumericCssVar } from '../service/dom';

/**
 * TODO modularise
 */
import npcJson from '../../public/npc/first-npc.json'
const {animLookup} = npcJson;

/**
 * @param {string} npcKey 
 * @param {Geom.VectJson} position 
 * @param {{ disabled?: boolean; panZoomApi: PanZoom.CssApi; npcs: NPC.NPCs; }} deps
 * @returns {NPC.NPC}
 */
export default function createNpc(
  npcKey,
  position,
  { disabled, panZoomApi, npcs },
) {

  /** @type {NPC.NPC['anim']} shortcut */
  const anim = {
    path: [],
    count: 0,
    aux: { angs: [], bounds: new Rect, edges: [], elens: [], navPathPolys: [], sofars: [], total: 0 },
    spriteSheet: 'idle',

    translate: new Animation,
    rotate: new Animation,
    sprites: new Animation,

    wayMetas: [],
    wayTimeoutId: 0,
  };

  return {
    key: npcKey,
    epochMs: Date.now(),
    // TODO hook up initial angle
    def: { key: npcKey, position, angle: 0, paused: !!disabled },
    el: {
      root: /** @type {HTMLDivElement} */ ({}),
      body: /** @type {HTMLDivElement} */ ({}),
    },
    anim,

    async cancel() {
      console.log(`cancel: cancelling ${this.def.key}`);
      if (anim.spriteSheet === 'idle') {
        return;
      }
      this.clearWayMetas();
      if (this.el.root?.getAnimations().includes(anim.translate)) {
        anim.translate.commitStyles();
      }
      if (this.el.body instanceof HTMLDivElement) {
        this.setLookTarget(this.getAngle());
      }
      await/** @type {Promise<void>} */ (new Promise(resolve => {
        anim.translate.addEventListener('cancel', () => resolve());
        anim.translate.cancel();
        anim.rotate.cancel();
      }));
    },
    clearWayMetas() {
      anim.wayMetas.length = 0;
    },
    async followNavPath(path, opts) {
      anim.path = path.map(Vect.from);
      this.clearWayMetas();
      this.updateAnimAux();
      if (anim.path.length <= 1 || anim.aux.total === 0) {
        return;
      }
            
      if (opts?.globalNavMetas) {
        anim.wayMetas = opts.globalNavMetas.map((navMeta) => ({
          ...navMeta,
          length: Math.max(0, anim.aux.sofars[navMeta.index] + navMetaOffsets[navMeta.key]),
        }));
      }

      this.setSpritesheet('walk');
      this.startAnimation();
      npcs.events.next({ key: 'started-walking', npcKey: this.def.key });
      console.log(`followNavPath: ${this.def.key} started walk`);
      this.nextWayTimeout();

      try {
        await /** @type {Promise<void>} */ (new Promise((resolve, reject) => {
          anim.translate.addEventListener('finish', () => {
            console.log(`followNavPath: ${this.def.key} finished walk`);
            resolve();
          });
          anim.translate.addEventListener('cancel', () => {
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
      const { aux } = anim;
      return {
        translateKeyframes: anim.path.flatMap((p, i) => [
          {
            offset: aux.sofars[i] / aux.total,
            transform: `translate(${p.x}px, ${p.y}px)`,
          },
        ]),
        rotateKeyframes: anim.path.flatMap((p, i) => [
          {
            offset: aux.sofars[i] / aux.total,
            transform: `rotateZ(${aux.angs[i - 1] || aux.angs[i] || 0}rad) scale(${npcScale})`
          },
          {
            offset: aux.sofars[i] / aux.total,
            transform: `rotateZ(${aux.angs[i] || aux.angs[i - 1] || 0}rad) scale(${npcScale})`
          },
        ]),
        opts: { duration: aux.total * npcAnimScaleFactor, direction: 'normal', fill: 'forwards' },
      };
    },
    getBounds() {
      const center = this.getPosition();
      const radius = this.getRadius();
      return new Rect(
        center.x - radius,
        center.y - radius,
        2 * radius,
        2 * radius,
      );
    },
    getLineSeg() {
      const dst = this.getTarget();
      if (dst) {
        const src = this.getPosition();
        return { src, dst, tangent: dst.clone().sub(src).normalize() };
      } else {
        return null;
      }
    },
    getPosition() {
      // TODO avoid getBoundingClientRect undefined
      const { x: clientX, y: clientY } = Vect.from(this.el.root.getBoundingClientRect?.() || [0, 0]);
      return Vect.from(panZoomApi.getWorld({ clientX, clientY })).precision(2);
    },
    getRadius() {
      return getNumericCssVar(this.el.root, cssName.npcBoundsRadius);
    },
    getSpeed() {
      return npcSpeed;
    },
    /**
     * Shorten duration of anim.sprites slightly,
     * ensuring we finish at nice 0-based frame (0 or 5).
     * - we ensure half returned value divides `motionMs`
     * - we use an offset `motionMs` to end mid-frame
     */
    getSpriteDuration(nextMotionMs) {
      const baseSpriteMs = npcWalkAnimDurationMs;
      const motionMs = nextMotionMs - (0.5 * (npcWalkAnimDurationMs / animLookup.walk.frameCount));
      return motionMs < baseSpriteMs / 2
        ? baseSpriteMs // degenerate case
        // Alternatively, use Math.floor for longer duration
        : (2 * motionMs) / Math.ceil(2 * (motionMs / baseSpriteMs));
    },
    getTarget() {
      if (anim.spriteSheet === "walk" && anim.translate.currentTime !== null) {
        const soFarMs = anim.translate.currentTime;
        const nextIndex = anim.aux.sofars.findIndex(sofar => (sofar * npcAnimScaleFactor) > soFarMs);
        // Expect -1 iff at final point
        return nextIndex === -1 ? null : anim.path[nextIndex].clone();
      } else {
        return null;
      }
    },
    getTargets() {
      if (anim.spriteSheet === "walk" && anim.translate.currentTime !== null) {
        const soFarMs = anim.translate.currentTime;
        return anim.aux.sofars
          .map((sofar, i) => ({ point: anim.path[i].clone(), arriveMs: (sofar * npcAnimScaleFactor) - soFarMs }))
          .filter(x => x.arriveMs >= 0)
      } else {
        return [];
      }
    },
    getWalkBounds() {
      return anim.spriteSheet === 'walk' && anim.translate.playState === 'running'
        ? anim.aux.bounds
        : this.getBounds();
    },
    lookAt(point) {
      const position = this.getPosition();
      const direction = Vect.from(point).sub(position);
      if (direction.length === 0) {
        return this.getAngle();
      }
      // Ensure we don't turn more than 180 deg
      const targetLookRadians = getNumericCssVar(this.el.root, cssName.npcTargetLookAngle);
      let radians = Math.atan2(direction.y, direction.x);
      while (radians - targetLookRadians > Math.PI) radians -= 2 * Math.PI;
      while (targetLookRadians - radians > Math.PI) radians += 2 * Math.PI;
      this.setLookTarget(radians); // Only works when idle, otherwise overridden
      return radians;
    },
    nextWayTimeout() {
      if (anim.translate.currentTime === null) {
        return console.warn('nextWayTimeout: anim.root.currentTime is null')
      }
      if (anim.wayMetas[0]) {
        anim.wayTimeoutId = window.setTimeout(
          this.wayTimeout.bind(this),
          (anim.wayMetas[0].length * npcAnimScaleFactor) - anim.translate.currentTime,
        );
      }
    },
    npcRef(rootEl) {
      if (rootEl && this.anim.count === 0) {
        this.el.root = rootEl;
        this.el.body = /** @type {HTMLDivElement} */ (rootEl.childNodes[0]);
        this.el.root.style.transform = `translate(${this.def.position.x}px, ${this.def.position.y}px)`;
        this.setLookTarget(0); // Set CSS variable
        this.el.root.style.setProperty(cssName.npcBoundsRadius, `${npcRadius}px`);
      }
    },
    pause() {
      console.log(`pause: pausing ${this.def.key}`);
      anim.translate.pause();
      anim.rotate.pause();
      anim.sprites.pause();
      anim.translate.commitStyles();
      this.setLookTarget(this.getAngle());
      /**
       * Pending wayMeta is at anim.wayMetas[0].
       * No need to adjust its `length` because we use animation currentTime.
       */
      window.clearTimeout(anim.wayTimeoutId);
      if (this.def.key === npcs.playerKey) {
        // Pause camera tracking
        npcs.getPanZoomApi().animationAction('pause');
      }
    },
    play() {
      console.log(`play: resuming ${this.def.key}`);
      anim.translate.play();
      anim.rotate.play();
      anim.sprites.play();
      this.nextWayTimeout();
      if (this.def.key === npcs.playerKey) {
        // Resume camera tracking
        npcs.getPanZoomApi().animationAction('play');
      }
    },
    setLookTarget(radians) {
      this.el.root.style.setProperty(cssName.npcTargetLookAngle, `${radians}rad`);
    },
    setSpritesheet(spriteSheet) {
      if (spriteSheet !== this.anim.spriteSheet) {
        this.el.root.classList.remove(this.anim.spriteSheet);
        this.el.root.classList.add(spriteSheet);
        this.anim.spriteSheet = spriteSheet;
      }
    },
    startAnimation() {
      if (anim.count) {
        anim.translate.commitStyles();
        anim.translate.cancel();
        this.setLookTarget(this.getAngle());
        anim.rotate.cancel();
      }

      if (anim.spriteSheet === 'walk') {
        // Animate position and rotation
        const { translateKeyframes, rotateKeyframes, opts } = this.getAnimDef();
        anim.translate = this.el.root.animate(translateKeyframes, opts);
        anim.rotate = this.el.body.animate(rotateKeyframes, opts);

        // Animate spritesheet
        const spriteMs = this.getSpriteDuration(opts.duration);
        anim.sprites = this.el.body.animate([
          { offset: 0, backgroundPosition: '0px' },
          { offset: 1, backgroundPosition: `${-animLookup.walk.frameCount * animLookup.walk.aabb.width}px` },
        ], {
          easing: `steps(${animLookup.walk.frameCount})`,
          duration: spriteMs, // ~ npcWalkAnimDurationMs
          iterations: Infinity,
        });

      } else if (anim.spriteSheet === 'idle') {
        this.clearWayMetas();
        // Post walk, set target as current angle 
        this.setLookTarget(this.getAngle());

        // Below needed?
        anim.translate = this.el.root.animate([], { duration: 2 * 1000, iterations: Infinity });
        anim.rotate = this.el.body.animate([], { duration: 2 * 1000, iterations: Infinity });
        anim.sprites = this.el.body.animate([], { duration: 2 * 1000, iterations: Infinity });
      }

      anim.count++;
    },
    updateAnimAux() {
      const { aux } = anim;
      const radius = this.getRadius();
      aux.bounds = Rect.fromPoints(...anim.path).outset(radius);
      aux.edges = anim.path.map((p, i) => ({ p, q: anim.path[i + 1] })).slice(0, -1);
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
      } else if (anim.translate.currentTime >= (anim.wayMetas[0].length * npcAnimScaleFactor) - 1) {
        /**
         * We've reached the wayMeta's `length`,
         * so remove it and trigger respective event.
         */
        const wayMeta = /** @type { NPC.WayPointMeta} */ (anim.wayMetas.shift());
        console.log(wayMeta); // DEBUG 🚧
        npcs.events.next({ key: 'way-point', npcKey: this.def.key, meta: wayMeta });
      }
      this.nextWayTimeout();
    },
  };
}

/**
 * Scale factor we'll apply to sprites.
 * Beware that sprites are probably themselves scaled up relative to original SVG.
 * See zoom factor in json.
 */
export const npcScale = 0.19;

/** Radius inside SVG */
const npcRadiusInSvg = 40;

/** Ensure NPC faces along positive x-axis */
export const npcOffsetRadians = 0;

export const npcRadius = npcRadiusInSvg * npcScale * npcJson.zoom;

export const defaultNpcInteractRadius = npcRadius * 3;
// export const defaultNpcInteractRadius = npcRadius;

/** Number of world units per second. */
export const npcSpeed = 70;

/** Used to scale up how long it takes to move along navpath */
export const npcAnimScaleFactor = 1000 * (1 / npcSpeed);

const npcWalkAnimDurationMs = ( 1 / npcSpeed ) * (animLookup.walk.totalDist * npcScale) * 1000;

/** @type {Record<NPC.NavMetaKey, number>} */
const navMetaOffsets = {
  'enter-room': -0.02, // Ensure triggered
  'exit-room': -0.02, // Ensure triggered
  'pre-collide': -0.02,
  "pre-exit-room": -(npcRadius + 10), // TODO better way
  "pre-near-door": -(npcRadius + 10), // TODO better way
  "start-seg": 0,
};
