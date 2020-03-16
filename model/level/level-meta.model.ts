import { Vector2, Vector2Json } from '@model/vec2.model';
import { Poly2, Poly2Json } from '@model/poly2.model';
import { Redacted, redact } from '@model/redux.model';

export const metaPointRadius = 2;

export class LevelMeta {
  
  public get json(): LevelMetaJson {
    return {
      key: this.key,
      lightPoly: this.lightPoly.map(({ json }) => json),
      position: this.position.json,
      tags: this.tags.slice(),
    };
  }

  constructor(
    /** Unique identifier */
    public key: string,
    public position: Vector2,
    public tags = [] as string[],
    public lightPoly = [] as Redacted<Poly2>[],
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

  public static fromJson(json: LevelMetaJson): LevelMeta {
    return new LevelMeta(
      json.key,
      Vector2.from(json.position),
      json.tags.slice(),
      json.lightPoly.map(x => redact(Poly2.fromJson(x)))
    );
  }
}

export interface LevelMetaJson {
  key: string;
  position: Vector2Json;
  tags: string[];
  lightPoly: Poly2Json[];
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
      dialogPosition: src.position.clone().translate(3, -3),
      position: src.position.clone(),
    } as LevelMetaUi
  };
}