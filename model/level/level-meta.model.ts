import { generate } from 'shortid';
import { Vector2, Vector2Json } from '@model/vec2.model';
import { LevelLight, LevelLightJson } from './level-light.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2Json, Rect2 } from '@model/rect2.model';
import { intersects, testNever } from '@model/generic.model';
import { pointOnLineSeg } from './geom.model';

export const metaPointRadius = 1;
export const rectTagRegex = /^r-(\d+)(?:-(\d+))?$/;

export class LevelMeta {
  
  public get json(): LevelMetaJson {
    return {
      key: this.key,
      light: this.light?.json,
      tags: this.tags.slice(),
      rect: this.triggerRect?.json,
      circular: this.circular || undefined,
    };
  }

  constructor(
    /** Unique identifier */
    public key = `m-${generate()}`,
    public tags = [] as string[],
    public light: null | LevelLight = null,
    public triggerRect: null | Rect2 = null,
    /** Trigger is rectangular or circular  */
    public circular: boolean = false,
  ) {}

  public clone(newKey: string) {
    return new LevelMeta(
      newKey,
      this.tags.slice(),
      this.light?.clone() || null,
      this.triggerRect?.clone() || null,
      this.circular,
    );
  }

  public static fromJson(json: LevelMetaJson): LevelMeta {
    return new LevelMeta(
      json.key,
      json.tags.slice(),
      json.light ? LevelLight.fromJson(json.light) : null,
      json.rect ? Rect2.fromJson(json.rect) : null,
      json.circular??false,
    );
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
  tags: string[];
  light?: LevelLightJson;
  circular?: true;
  rect?: Rect2Json;
}

export type LevelMetaUpdate = (
  | { key: 'add-tag'; tag: string; metaKey: string }
  | { key: 'remove-tag'; tag: string; metaKey: string }
  | { key: 'set-position'; position: Vector2Json }
  | { key: 'ensure-meta-index'; metaIndex: number }
);

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

  public applyUpdates(update: LevelMetaUpdate): void {
    switch (update.key) {
      case 'add-tag': {
        const meta = this.metas.find(({ key }) => key === update.metaKey);
        if (meta) {
          meta.tags = meta.tags.filter((tag) => tag !== update.tag).concat(update.tag);
          update.tag === 'light' && (meta.light = new LevelLight(this.position));
          update.tag === 'circle' && (meta.circular = true);
  
          if (rectTagRegex.test(update.tag)) {
            const [, w, h = w, ] = update.tag.match(rectTagRegex)!;
            meta.triggerRect = new Rect2(this.position.x, this.position.y, Number(w), Number(h));
            meta.tags = meta.tags.filter((tag, i) => !(rectTagRegex.test(tag) && i < meta.tags.length - 1));
          }
        }
        break;
      }
      case 'remove-tag': {
        const meta = this.metas.find(({ key }) => key === update.metaKey);
        if (meta) {
          meta.tags = meta.tags.filter((tag) => tag !== update.tag);
          update.tag === 'light' && (meta.light = null);
          update.tag === 'circle' && (meta.circular = false);
          rectTagRegex.test(update.tag) && (meta.triggerRect = null);
        }
        break;
      }
      case 'set-position': {
        this.position = Vector2.from(update.position);
        this.metas.forEach(({ light, triggerRect }) => {
          light?.setPosition(this.position);
          triggerRect?.setPosition(this.position);
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
      meta.triggerRect?.setPosition(position);
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
      metas.map(meta => LevelMeta.fromJson(meta)),
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
      dialogPosition: src.position.clone().translate(-34, -0.5),
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
