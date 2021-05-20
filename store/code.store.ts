import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { KeyedLookup } from 'model/generic.model';
import { LookupUpdates, updateLookup } from './store.util';
 
 export type State = {
   code: KeyedLookup<CodeMeta>;
 
   readonly api: {
     getCode: (codeKey: string) => CodeMeta;
     persist: (codeKey: string) => void;
     rehydrate: (codeKeys: string[]) => void;
     updateCode: (codeKey: string, updates: LookupUpdates<CodeMeta>) => void;
   };
 }

interface CodeMeta {
  key: string;
  original: string;
  current: string;
  lazy: boolean;
  persist: boolean;
}

interface CodeMetaJson {
  current: string;
  lazy: boolean;
}
 
const useStore = create<State>(devtools((set, get) => ({
  code: {},
  
  api: {
    getCode: (codeKey) => {
      return get().code[codeKey];
    },

    persist: (codeKey) => {
      const { key, current, lazy, persist } = api.getCode(codeKey);

      if (persist) {
        const json: CodeMetaJson = { current, lazy };
        localStorage.setItem(`code:${key}`, JSON.stringify(json));
      }
    },

    rehydrate: (codeKeys) => {
      // TODO
    },

    updateCode: (codeKey, updates) => {
      set(({ code }) => ({
        code: updateLookup(codeKey, code, typeof updates === 'function' ? updates : () => updates),
      }));
    },
  },
 }), 'code'));
 
 const api = useStore.getState().api;
 const useCodeStore = Object.assign(useStore, { api });
 
 export default useCodeStore;
 