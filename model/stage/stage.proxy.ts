import * as Stage from "./stage.model";
import useStage from "store/stage.store";

export function createStageProxy(stageKey: string) {
  const stage = () => useStage.api.getStage(stageKey);

  return new Proxy({} as Stage.StageMeta, {
    get(_, key: keyof Stage.StageMeta | 'root') {

      switch (key) {
        case 'opt':
          return new Proxy({} as Stage.StageOpts, {
            get(_, key: keyof Stage.StageOpts) {
              return stage().opt[key];
            },
            set(_, key: string, value: any) {
              if (!Stage.stageOptKeys.includes(key))
                throw Error(`unknown stage option ${key}`);
              useStage.api.updateOpt(stageKey, { [key]: value });
              return true;
            },
            deleteProperty: (_, _key: string) => {
              throw Error(`cannot delete option`);
            },
            ownKeys: () => Object.keys(stage().opt),
            getOwnPropertyDescriptor: configurableDescriptor,
          });
        case 'extra':
          return {
            ...stage().extra,
            canvasPreview: undefined, // Hide large DataUrl
          };
        case 'root':
          return stage().scene.children[1];
        default:
          return stage()[key];
      }
    },

    set(_, _key: keyof Stage.StageMeta, _value: any) {
      throw Error('cannot set top-level key of stage');
    },

    deleteProperty: (_, _key: keyof Stage.StageMeta) => {
      throw Error('cannot delete top-level key of stage');
    },

    ownKeys: () => Object.keys(stage()).concat('root'),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  });
}

function configurableDescriptor() {
  return { enumerable: true, configurable: true };
}

// TODO can replace set protection on `stage`?
function unconfigurableDescriptor() {
  return { enumerable: true, configurable: false };
}
