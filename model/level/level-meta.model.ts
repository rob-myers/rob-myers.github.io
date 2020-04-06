import { generate } from 'shortid';
import { Vector2, Vector2Json } from '@model/vec2.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2Json, Rect2 } from '@model/rect2.model';
import { intersects, testNever } from '@model/generic.model';
import { iconLookup } from '@model/icon/icon.model';
import { pointOnLineSeg } from './geom.model';
import { LevelLight, LevelLightJson } from './level-light.model';

type IconType = keyof typeof iconLookup;
const isIconTag = (tag: string): tag is IconType => tag in iconLookup;

const rectTagsLookup = {
  circ: null,
  door: null,
  horiz: null,
  light: null,
  pickup: null,
  rect: null,
  vert: null,
};
/** Tags which use `LevelMeta.rect`. They are mutually exclusive. */
const isRectTag = (tag: string): tag is RectTag => tag in rectTagsLookup;
type RectTag = keyof typeof rectTagsLookup; 
type TriggerType =  Extract<RectTag, 'circ' | 'rect'>;
type PhysicalType = Extract<RectTag, 'door' | 'horiz' | 'pickup' | 'vert'>;

export const dimTagRegex = /^r-(\d+)(?:-(\d+))?$/;
const isDimTag = (tag: string) => dimTagRegex.test(tag);

export class LevelMeta {
  
  public get json(): LevelMetaJson {
    return {
      key: this.key,
      light: this.light?.json,
      physical: this.physical??undefined,
      rect: this.rect?.json,
      tags: this.tags.slice(),
      trigger: this.trigger??undefined,
      icon: this.icon?.key,
    };
  }

  constructor(
    /** Unique identifier */
    public key = `m-${generate()}`,
    public tags = [] as string[],
    public light: null | LevelLight = null,
    public rect: null | Rect2 = null,
    /** Trigger is rectangular or circular  */
    public trigger: null | TriggerType = null,
    /** A pickup has a circular trigger, a door has no trigger */
    public physical: null | PhysicalType = null,
    public icon: null | {
      key: IconType;
      svg: string;
      rect: Rect2;
      scale: number;
      delta: Vector2;
    } = null,
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
      this.icon,
    );
  }

  public static from(json: LevelMetaJson): LevelMeta {
    const icon = json.icon && iconLookup[json.icon];
    return new LevelMeta(
      json.key,
      json.tags.slice(),
      json.light ? LevelLight.fromJson(json.light) : null,
      json.rect ? Rect2.fromJson(json.rect) : null,
      json.trigger??null,
      json.physical??null,
      icon ? {
        key: json.icon!,
        svg: icon.svg,
        rect: icon.rect,
        scale: 4 / icon.rect.dimension,
        delta: icon.rect.center.scale(4 / icon.rect.dimension),
      } : null
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

  public setRectTag(tag: RectTag, position: Vector2) {
    this.tags = this.tags.filter(x => !isRectTag(x)).concat(tag);
    this.light = null;
    this.physical = null;
    this.trigger = null;

    if (tag === 'door') {
      this.physical = 'door';
    } else if (tag === 'circ') {
      this.trigger = 'circ';
    } else if (tag === 'light') {
      this.light = new LevelLight(
        position,
        this.rect ? this.rect.dimension : undefined
      );
    } else if (tag === 'pickup') {
      this.physical = 'pickup';
      this.trigger = 'circ';
    } else if (tag === 'rect') {
      this.trigger = 'rect';
    }
  }

  public setIconTag(tag: IconType) {
    this.tags = this.tags.filter(x => !isIconTag(x)).concat(tag);
    const icon = iconLookup[tag];
    this.icon = {
      key: tag,
      svg: icon.svg,
      rect: icon.rect,
      scale: 4 / icon.rect.dimension,
      delta: icon.rect.center.scale(4 / icon.rect.dimension),
    };
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
  physical?: PhysicalType;
  rect?: Rect2Json;
  tags: string[];
  trigger?: TriggerType;
  icon?: IconType;
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
        meta.addTag(update.tag);

        if (isDimTag(update.tag)) {
          // Handle rect dimension add/update
          const [, w, h = w, ] = update.tag.match(dimTagRegex)!;
          meta.rect = new Rect2(this.position.x, this.position.y, Number(w), Number(h));
          meta.tags = meta.tags.filter(x => !isDimTag(x)).concat(update.tag);
          meta.light?.setRange(meta.rect.dimension);
          // Detect if a rect tag already exists
          for (const tag of meta.tags) {
            if (isRectTag(tag)) {
              meta.setRectTag(tag, this.position);
              break;
            }
          }
        } else if (isRectTag(update.tag)) {
          meta.setRectTag(update.tag, this.position);
        } else if (isIconTag(update.tag)) {
          meta.tags.includes('icon') && meta.setIconTag(update.tag);
        } else if (update.tag === 'icon') {
          // Detect if icon tag already exists
          for (const tag of meta.tags) {
            if (isIconTag(tag)) {
              meta.setIconTag(tag);
              break;
            }
          }
        }

        break;
      }
      case 'remove-tag': {
        const meta = this.metas.find(({ key }) => key === update.metaKey)!;
        meta.removeTags(update.tag);

        if (dimTagRegex.test(update.tag)) {
          meta.rect = null;
          meta.trigger = null;
          meta.physical = null;
          meta.light = null;
        } else if (isRectTag(update.tag)) {
          meta.trigger = null;
          meta.physical = null;
        } else if (update.tag === 'icon' || isIconTag(update.tag)) {
          meta.icon = null;
        }
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
