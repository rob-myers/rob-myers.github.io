import { Vector2, Vector2Json } from '@model/vec2.model';
import { LevelLight, LevelLightJson } from './level-light.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2Json, Rect2 } from '@model/rect2.model';
import { intersects } from '@model/generic.model';

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
    public key: string,
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

  /** Sets light polygon empty if light position not inside {polys}. */
  public validateLight(polys: Poly2[]) {
    if (this.light && !polys.some(p => p.contains(this.light!.position))) {
      this.light.resetPolygon();
      return false;
    }
    return !!this.light;
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
);

export interface LevelMetaUi {
  key: string;
  open: boolean;
  over: boolean;
  position: Vector2;
  dialogPosition: Vector2;
}

function createLevelMetaUi(key: string): LevelMetaUi {
  return {
    key,
    open: false,
    over: true, // Expect initially mouseover
    dialogPosition: Vector2.zero,
    position: Vector2.zero,
  };
}

export function syncLevelMetaUi(src: LevelMetaGroup, dst?: LevelMetaUi): LevelMetaUi {
  return {
    ...(dst || createLevelMetaUi(src.key)),
    ...{
      // dialogPosition: src.position.clone().translate(2.5, -3),
      dialogPosition: src.position.clone().translate(-33.5, 0.5),
      position: src.position.clone(),
    } as LevelMetaUi
  };
}

export class LevelMetaGroup {

  public get json(): LevelMetaGroupJson {
    return {
      key: this.key,
      metas: this.metas.map(meta => meta.json),
      position: this.position.json,
    };
  }

  constructor(
    /** Unique identifier */
    public key: string,
    public metas: LevelMeta[],
    public position: Vector2,
  ) {}

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

  public static from({ key, metas, position }: LevelMetaGroupJson): LevelMetaGroup {
    return new LevelMetaGroup(
      key,
      metas.map(meta => LevelMeta.fromJson(meta)),
      Vector2.from(position),
    );
  }

}

export interface LevelMetaGroupJson {
  key: string;
  metas: LevelMetaJson[];
  position: Vector2Json;
}
