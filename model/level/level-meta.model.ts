import { Vector2, Vector2Json } from '@model/vec2.model';
import { LevelLight, LevelLightJson } from './level-light.model';

export const metaPointRadius = 2;

export class LevelMeta {
  
  public get json(): LevelMetaJson {
    return {
      key: this.key,
      light: this.light ? this.light.json : null,
      position: this.position.json,
      tags: this.tags.slice(),
    };
  }

  constructor(
    /** Unique identifier */
    public key: string,
    public position: Vector2,
    public tags = [] as string[],
    public light: null | LevelLight = null,
  ) {}

  public applyUpdates(update: LevelMetaUpdate): void {
    switch (update.key) {
      case 'add-tag': {
        this.tags = this.tags.filter((tag) => tag !== update.tag).concat(update.tag);
        break;
      }
      case 'remove-tag': {
        this.tags = this.tags.filter((tag) => tag !== update.tag);
        break;
      }
      case 'set-position': {
        this.position = Vector2.from(update.position);
        break;
      }
    }
  }

  public clone(newKey: string, position = this.position.clone()) {
    const clone = new LevelMeta(newKey, position);
    clone.tags = this.tags.slice();
    return clone;
  }

  public static fromJson(json: LevelMetaJson): LevelMeta {
    return new LevelMeta(
      json.key,
      Vector2.from(json.position),
      json.tags.slice(),
      json.light ? LevelLight.fromJson(json.light) : null,
    );
  }
}

export interface LevelMetaJson {
  key: string;
  position: Vector2Json;
  tags: string[];
  light: null | LevelLightJson;
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