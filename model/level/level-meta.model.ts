import { Vector2, Vector2Json } from '@model/vec2.model';
import { Poly2, Poly2Json } from '@model/poly2.model';
import { Redacted, redact } from '@model/redux.model';

export const metaPointRadius = 1.5;

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

  public applyUpdates({ position, tags }: Partial<LevelMetaJson>): void {
    position && (this.position = Vector2.from(position));
    tags && (this.tags = tags.slice());
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
    over: false,
    dialogPosition: Vector2.zero,
    position: Vector2.zero,
  };
}

export function syncLevelMetaUi(src: LevelMeta, dst?: LevelMetaUi): LevelMetaUi {
  return {
    ...(dst || createLevelMetaUi(src.key)),
    ...{
      dialogPosition: src.position.clone().translate(3, 0),
      position: src.position.clone(),
    } as LevelMetaUi
  };
}