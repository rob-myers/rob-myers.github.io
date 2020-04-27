import { generate } from 'shortid';
import { Vector2, Vector2Json } from '@model/vec2.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2Json, Rect2 } from '@model/rect2.model';
import { intersects, testNever, keys } from '@model/generic.model';
import { iconLookup, IconType, Icon, createIcon } from '@model/icon/icon.model';
import { pointOnLineSeg } from './geom.model';
import { LevelLight, LevelLightJson } from './level-light.model';

const isIconTag = (tag: string): tag is IconType => tag in iconLookup;

const rebuildTagsLookup = {
  /** Rectangular hole */
  cut: null,
  /** Rectangular hole in internal walls */
  way: null,
  /** Horizontal wall */
  hz: null,
  /** Rectangular table */
  table: null,
  /** Vertical wall */
  vt: null,
};
export type RebuildTag = keyof typeof rebuildTagsLookup; 
export const isRebuildTag = (tag: string): tag is RebuildTag => tag in rebuildTagsLookup;
export const rebuildTags = keys(rebuildTagsLookup);

const rectTagsLookup = {
  ...rebuildTagsLookup,
  circ: null,
  light: null,
  rect: null,
};
/** Tags which use `LevelMeta.rect`. They are mutually exclusive. */
const isRectTag = (tag: string): tag is RectTag => tag in rectTagsLookup;
export type RectTag = keyof typeof rectTagsLookup; 

type TriggerType =  Extract<RectTag, 'circ' | 'rect'>;
type PhysicalType = Extract<RectTag, 'cut' | 'way' | 'hz' | 'table' | 'vt'>;

/** e.g. `r-4` or `r-4-2` */
export const dimTagRegex = /^r-(\d+)(?:-(\d+))?$/;
const isDimTag = (tag: string) => dimTagRegex.test(tag);

const navTagsLookup = {
  ...rectTagsLookup,
  steiner: null,
};
export type NavTag = keyof typeof navTagsLookup; 
export const isNavTag = (tag: string): tag is NavTag => tag in navTagsLookup;
export const navTags = keys(navTagsLookup);

export class LevelMeta {
  
  public get json(): LevelMetaJson {
    return {
      key: this.key,
      tags: this.tags.slice(),
      position: this.position.json,
      light: this.light?.json,
      physical: this.physical??undefined,
      rect: this.rect?.json,
      trigger: this.trigger??undefined,
      icon: this.icon?.key,
    };
  }

  constructor(
    /** Unique identifier */
    public key = `m-${generate()}`,
    public tags = [] as string[],
    /** Useful when we ungroup metas in 'live' mode */
    public position = Vector2.zero,
    public light: null | LevelLight = null,
    public rect: null | Rect2 = null,
    /** Trigger is rectangular or circular  */
    public trigger: null | TriggerType = null,
    public physical: null | PhysicalType = null,
    public icon: null | Icon = null,
  ) {}

  public addTag(tag: string) {
    this.tags = this.tags.filter((other) => other !== tag).concat(tag);
  }

  public clone(newKey: string) {
    return new LevelMeta(
      newKey,
      this.tags.slice(),
      this.position.clone(),
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
      Vector2.from(json.position),
      json.light ? LevelLight.fromJson(json.light) : null,
      json.rect ? Rect2.fromJson(json.rect) : null,
      json.trigger??null,
      json.physical??null,
      icon ? createIcon(json.icon!) : null
    );
  }
  
  public isRectMeta() {
    return this.rect && this.tags.some(tag => isRectTag(tag));
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
    this.light = this.physical = this.trigger = null;

    switch(tag) {
      case 'circ': this.trigger = 'circ'; break;
      case 'cut': this.physical = 'cut'; break;
      case 'way': this.physical = 'way'; break;
      case 'hz': this.physical = 'hz'; break;
      case 'light': {
        this.rect && (this.light = new LevelLight(position, this.rect.dimension));
        break;
      }
      case 'rect': this.trigger = 'rect'; break;
      case 'table': this.physical = 'table'; break;
      case 'vt': this.physical = 'vt'; break;
      default: throw testNever(tag);
    }
  }

  public setIconTag(tag: IconType) {
    this.tags = this.tags.filter(x => !isIconTag(x)).concat(tag);
    this.icon = createIcon(tag);
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
  position: Vector2Json;
  light?: LevelLightJson;
  physical?: PhysicalType;
  rect?: Rect2Json;
  tags: string[];
  trigger?: TriggerType;
  icon?: IconType;
}

/** Apply an update to a LevelMetaGroup */
export type LevelMetaUpdate = (
  | { key: 'add-tag'; tag: string; metaKey: string }
  | { key: 'remove-tag'; tag: string; metaKey: string }
  | { key: 'set-position'; position: Vector2Json }
  | { key: 'ensure-meta-index'; metaIndex: number }
  | { key: 'move-to-back' }
  | { key: 'move-to-front' }
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
      backupIconKey: this.backupIcon.key,
    };
  }

  constructor(
    /** Unique identifier */
    public key: string,
    public metas: LevelMeta[],
    public position: Vector2,
    /** Current meta index. */
    public metaIndex = 0,
    public backupIcon = createIcon('meta-1'),
  ) {
    if (!this.metas.length) {
      this.metas.push(new LevelMeta());
      this.metaIndex = 0;
    }
  }

  /**
   * Handle updates local to a LevelMetaGroup.
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
          meta.light = null;
        } else if (update.tag === 'icon' || isIconTag(update.tag)) {
          meta.icon = null;
        }
        break;
      }
      case 'set-position': {
        this.position = Vector2.from(update.position);
        this.metas.forEach(({ position, light, rect }) => {
          position.copy(update.position);
          light?.setPosition(this.position);
          rect?.setPosition(this.position);
        });
        break;
      }
      case 'ensure-meta-index': {
        if (!this.metas[update.metaIndex]) {
          const meta = new LevelMeta();
          this.metas[update.metaIndex] = meta;
          this.metas[update.metaIndex].position.copy(this.position);
        }
        this.metaIndex = update.metaIndex;
        break;
      }
      case 'move-to-back':
      case 'move-to-front':
        break;
      default: throw testNever(update);
    }

    if (!this.hasIcon()) {
      this.ensureBackupIcon();
    }
  }

  public clone(newKey: string, position = this.position.clone()) {
    const clone = new LevelMetaGroup(
      newKey,
      this.metas.map(meta => meta.clone(`${newKey}-${meta.key}`)),
      position.clone(),
      0,
      createIcon(this.backupIcon.key),
    );
    clone.metas.forEach(meta => {
      meta.position.copy(position);
      meta.light?.setPosition(position);
      meta.rect?.setPosition(position);
    });
    return clone;
  }

  public static from({
    key,
    metas,
    position,
    metaIndex,
    backupIconKey: iconKey,
  }: LevelMetaGroupJson): LevelMetaGroup {
    return new LevelMetaGroup(
      key,
      metas.map(meta => LevelMeta.from(meta)),
      Vector2.from(position),
      metaIndex,
      createIcon(iconKey),
    );
  }

  private ensureBackupIcon() {
    const rectMetas = this.metas.filter(meta => meta.isRectMeta());
    
    if (rectMetas.length === 1) {
      const [tag] = rectMetas[0].tags.filter(x => isRectTag(x)) as RectTag[];
      switch (tag) {
        case 'circ': this.backupIcon = createIcon('meta-1'); break;
        case 'way': this.backupIcon = createIcon('door-1'); break;
        case 'light': this.backupIcon = createIcon('light-1'); break;
        case 'rect': this.backupIcon = createIcon('meta-1'); break;
        default: this.backupIcon = createIcon('meta-1');
      }
    } else {
      this.backupIcon = createIcon('meta-1');
    }

  }

  public hasIcon() {
    return this.metas.some(({ icon }) => !!icon);
  }

  public hasTag(tag: string) {
    return this.metas.some(meta => meta.tags.includes(tag));
  }

  public hasSomeTag(tags: string[]) {
    return this.metas.some(meta => intersects(meta.tags, tags));
  }

  public hideWhenLive() {
    return !this.metas.some(x => x.trigger || x.icon);
  }

}

export interface LevelMetaGroupJson {
  key: string;
  metas: LevelMetaJson[];
  position: Vector2Json;
  metaIndex: number;
  backupIconKey: IconType;
}


export interface LevelMetaGroupUi {
  /** metaGroupKey */
  key: string;
  open: boolean;
  over: boolean;
  position: Vector2;
}

export function syncMetaGroupUis(
  toGroup: Record<string, LevelMetaGroup>,
  toPrevUi: Record<string, LevelMetaGroupUi>,
) {
  return Object.values(toGroup).reduce((agg, group) => ({
    ...agg,
    [group.key]: {
      ...(toPrevUi[group.key] || createMetaGroupUi(group.key)),
      position: group.position.clone(),
    },
  }), {} as Record<string, LevelMetaGroupUi>);
}

function createMetaGroupUi(key: string): LevelMetaGroupUi {
  return {
    key,
    open: false,
    over: true, // Assume initially over
    position: Vector2.zero,
  };
}
