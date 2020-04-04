import { generate } from 'shortid';
import { Vector2, Vector2Json } from '@model/vec2.model';
import { LevelLight, LevelLightJson } from './level-light.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2Json, Rect2 } from '@model/rect2.model';
import { intersects, testNever } from '@model/generic.model';
import { pointOnLineSeg } from './geom.model';

export const rectTagRegex = /^r-(\d+)(?:-(\d+))?$/;

const specialTags = ['block', 'circ', 'light', 'pickup', 'rect'];

export class LevelMeta {
  
  public get json(): LevelMetaJson {
    return {
      key: this.key,
      light: this.light?.json,
      physical: this.physical??undefined,
      rect: this.rect?.json,
      tags: this.tags.slice(),
      trigger: this.trigger??undefined,
    };
  }

  constructor(
    /** Unique identifier */
    public key = `m-${generate()}`,
    public tags = [] as string[],
    public light: null | LevelLight = null,
    public rect: null | Rect2 = null,
    /** Trigger is rectangular or circular  */
    public trigger: null | 'rect' | 'circ' = null,
    /** Pickup has circular trigger, block has no trigger */
    public physical: null | 'pickup' | 'block' = null,
  ) {}

  public addTag(tag: string) {
    this.tags = this.tags.filter((other) => other !== tag).concat(tag);
  }

  public clone(newKey: string) {
    return new LevelMeta(
      newKey,
      this.tags.slice(),
      this.light?.clone() || null,
      this.rect?.clone() || null,
      this.trigger,
      this.physical,
    );
  }

  public static from(json: LevelMetaJson): LevelMeta {
    return new LevelMeta(
      json.key,
      json.tags.slice(),
      json.light ? LevelLight.fromJson(json.light) : null,
      json.rect ? Rect2.fromJson(json.rect) : null,
      json.trigger??null,
      json.physical??null,
    );
  }

  /** Remove all tags matching `removeRegex` */
  public removeTags(removeRegex: RegExp): void;
  /** Remove all tags included in `tags` */
  public removeTags(...tags: string[]): void;
  public removeTags(...input: (string | RegExp)[]) {
    this.tags = this.tags.filter(tag => typeof input[0] === 'string'
      ? !input.includes(tag)
      : !input[0].test(tag)
    );
  }

  public setAs(
    tag: 'block' | 'circ' | 'light' | 'pickup' | 'rect' | string,
    position: Vector2,
  ) {
    if (!specialTags.includes(tag)) return;
    this.removeTags(...specialTags.filter(x => x !== tag));

    switch (tag) {
      case 'block': {
        this.light = null;
        this.physical = 'block';
        this.trigger = null;
        break;
      }
      case 'circ': {
        this.light = null;
        this.physical = null;
        this.trigger = 'circ';
        break;
      }
      case 'light': {
        this.physical = null;
        this.trigger = null;
        this.light = new LevelLight(
          position,
          this.rect ? this.rect.dimension : undefined
        );
        break;
      }
      case 'pickup': {
        this.light = null;
        this.physical = 'pickup';
        this.trigger = 'circ';
        break;
      }
      case 'rect': {
        this.light = null;
        this.physical = null;
        this.trigger = 'rect';
        break;
      }
    }
  }

  /**
   * Returns true iff light exists and is valid.
   * We also clear the light polygon if light exists and is invalid.
   */
  public validateLight(polys: Poly2[], wallSegs: [Vector2, Vector2][]) {
    if (
      !this.light
      || !polys.some(p => p.contains(this.light!.position))
      || wallSegs.some(([u, v]) => pointOnLineSeg(this.light!.position, u, v))
    ) {
      this.light?.resetPolygon();
      return false;
    }
    return true;
  }
}

export interface LevelMetaJson {
  key: string;
  light?: LevelLightJson;
  physical?: 'pickup' | 'block';
  rect?: Rect2Json;
  tags: string[];
  trigger?: 'rect' | 'circ';
}

export type LevelMetaUpdate = (
  | { key: 'add-tag'; tag: string; metaKey: string }
  | { key: 'remove-tag'; tag: string; metaKey: string }
  | { key: 'set-position'; position: Vector2Json }
  | { key: 'ensure-meta-index'; metaIndex: number }
);

/**
 * A group of LevelMetas.
 */
export class LevelMetaGroup {

  public get json(): LevelMetaGroupJson {
    return {
      key: this.key,
      metas: this.metas.map(meta => meta.json),
      position: this.position.json,
      metaIndex: this.metaIndex,
    };
  }

  constructor(
    /** Unique identifier */
    public key: string,
    public metas: LevelMeta[],
    public position: Vector2,
    public metaIndex = 0,
  ) {
    if (!this.metas.length) {
      this.metas.push(new LevelMeta());
      this.metaIndex = 0;
    }
  }

  /**
   * Core update handler
   */
  public applyUpdates(update: LevelMetaUpdate): void {
    switch (update.key) {
      case 'add-tag': {
        const meta = this.metas.find(({ key }) => key === update.metaKey)!;

        if (rectTagRegex.test(update.tag)) {// Rectangle update
          const [, w, h = w, ] = update.tag.match(rectTagRegex)!;
          meta.rect = new Rect2(this.position.x, this.position.y, Number(w), Number(h));
          meta.removeTags(rectTagRegex);
          meta.light?.setRange(meta.rect.dimension);
          
          meta.tags.forEach(tag => specialTags.includes(tag) && meta.setAs(tag, this.position));
        }

        meta.setAs(update.tag, this.position);
        meta.addTag(update.tag);
        break;
      }
      case 'remove-tag': {
        const meta = this.metas.find(({ key }) => key === update.metaKey)!;

        if (rectTagRegex.test(update.tag)) {
          meta.rect = null;
          meta.light = null;
        }

        switch (update.tag) {
          case 'block': {
            meta.physical = null;
            break;
          }
          case 'circ': {
            meta.trigger = null;
            break;
          }
          case 'light': {
            meta.light = null;
            break;
          }
          case 'pickup': {
            meta.physical = null;
            meta.trigger = null;
            break;
          }
          case 'rect': {
            meta.trigger = null;
            break;
          }
        }
        meta.removeTags(update.tag);
        break;
      }
      case 'set-position': {
        this.position = Vector2.from(update.position);
        this.metas.forEach(({ light, rect }) => {
          light?.setPosition(this.position);
          rect?.setPosition(this.position);
        });
        break;
      }
      case 'ensure-meta-index': {
        if (!this.metas[update.metaIndex]) {
          this.metas[update.metaIndex] = new LevelMeta();
        }
        this.metaIndex = update.metaIndex;
        break;
      }
      default: throw testNever(update);
    }
  }

  public clone(
    newKey: string,
    position = this.position.clone(),
  ) {
    const clone = new LevelMetaGroup(
      newKey,
      this.metas.map(meta => meta.clone(`${newKey}-${meta.key}`)),
      position.clone(),
    );
    clone.metas.forEach(meta => {
      meta.light?.setPosition(position);
      meta.rect?.setPosition(position);
    });
    return clone;
  }

  public hasTag(tag: string) {
    return this.metas.some(meta => meta.tags.includes(tag));
  }

  public hasSomeTag(tags: string[]) {
    return this.metas.some(meta => intersects(meta.tags, tags));
  }

  public static from({
    key,
    metas,
    position,
    metaIndex,
  }: LevelMetaGroupJson): LevelMetaGroup {
    return new LevelMetaGroup(
      key,
      metas.map(meta => LevelMeta.from(meta)),
      Vector2.from(position),
      metaIndex,
    );
  }

}

export interface LevelMetaGroupJson {
  key: string;
  metas: LevelMetaJson[];
  position: Vector2Json;
  metaIndex: number;
}


export interface LevelMetaGroupUi {
  /** metaGroupKey */
  key: string;
  open: boolean;
  over: boolean;
  position: Vector2;
  dialogPosition: Vector2;
}

export function syncMetaGroupUi(src: LevelMetaGroup, dst?: LevelMetaGroupUi): LevelMetaGroupUi {
  return {
    ...(dst || createMetaGroupUi(src.key)),
    ...{
      dialogPosition: src.position.clone().translate(-35, -5),
      position: src.position.clone(),
    } as LevelMetaGroupUi
  };
}

function createMetaGroupUi(key: string): LevelMetaGroupUi {
  return {
    key,
    open: false,
    over: true, // Expect initially mouseover
    dialogPosition: Vector2.zero,
    position: Vector2.zero,
  };
}
