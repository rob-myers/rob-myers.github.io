import { Vector2, Vector2Json } from '@model/vec2.model';
import { LevelLight, LevelLightJson } from './level-light.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2Json, Rect2 } from '@model/rect2.model';

export const metaPointRadius = 1;

export class LevelMeta {
  
  public get json(): LevelMetaJson {
    return {
      key: this.key,
      light: this.light ? this.light.json : null,
      position: this.position.json,
      tags: this.tags.slice(),
      radius: this.triggerRadius === null ? null : this.triggerRadius,
      rect: this.triggerRect?.json || null,
    };
  }

  constructor(
    /** Unique identifier */
    public key: string,
    public position: Vector2,
    public tags = [] as string[],
    public light: null | LevelLight = null,
    public triggerRadius: null | number = null,
    public triggerRect: null | Rect2 = null,
  ) {}

  public applyUpdates(update: LevelMetaUpdate): void {
    switch (update.key) {
      case 'add-tag': {
        this.tags = this.tags.filter((tag) => tag !== update.tag).concat(update.tag);
        update.tag === 'light' && (this.light = new LevelLight(this.position));
        break;
      }
      case 'remove-tag': {
        this.tags = this.tags.filter((tag) => tag !== update.tag);
        update.tag === 'light' && (this.light = null);
        break;
      }
      case 'set-position': {
        this.position = Vector2.from(update.position);
        this.light?.setPosition(this.position);
        break;
      }
    }
  }

  public clone(newKey: string, position = this.position.clone()) {
    const clone = new LevelMeta(
      newKey,
      position,
      this.tags.slice(),
      this.light?.clone() || null,
      this.triggerRadius,
      this.triggerRect?.clone() || null,
    );
    clone.light?.setPosition(position);
    return clone;
  }

  public static fromJson(json: LevelMetaJson): LevelMeta {
    return new LevelMeta(
      json.key,
      Vector2.from(json.position),
      json.tags.slice(),
      json.light ? LevelLight.fromJson(json.light) : null,
      json.radius === null ? null : json.radius,
      json.rect ? Rect2.fromJson(json.rect) : null,
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
  position: Vector2Json;
  tags: string[];
  light: null | LevelLightJson;
  radius: null | number;
  rect: null | Rect2Json;
}

export type LevelMetaUpdate = (
  | { key: 'add-tag'; tag: string }
  | { key: 'remove-tag'; tag: string }
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

export function syncLevelMetaUi(src: LevelMeta, dst?: LevelMetaUi): LevelMetaUi {
  return {
    ...(dst || createLevelMetaUi(src.key)),
    ...{
      dialogPosition: src.position.clone().translate(2.5, -3),
      position: src.position.clone(),
    } as LevelMetaUi
  };
}