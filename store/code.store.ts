import create from 'zustand';
import { devtools } from 'zustand/middleware'
import { KeyedLookup } from 'model/generic.model';
import { addToLookup, LookupUpdates, updateLookup } from './store.util';
import { initialCode } from 'model/code/code.lib';
 
 export type State = {
   code: KeyedLookup<CodeMeta>;
 
   readonly api: {
     getCode: (codeKey: string) => CodeMeta;
     persist: (codeKey: string) => void;
     rehydrate: (codeKeys: string[]) => void;
     updateCode: (codeKey: string, updates: LookupUpdates<CodeMeta>) => void;
   };
 }

export interface CodeMeta {
  key: string;
  original: string;
  current: string;
  persist: boolean;
  updateEditorAt: number;
}

interface CodeMetaJson {
  current: string;
  persist: boolean;
}
 
const useStore = create<State>(devtools((set, get) => ({
  code: {},
  
  api: {
    getCode: (codeKey) => {
      return get().code[codeKey];
    },

    persist: (codeKey) => {
      const { current, persist } = api.getCode(codeKey);

      if (persist) {
        const state: CodeMetaJson = { current, persist };
        localStorage.setItem(`code:${codeKey}`, JSON.stringify({ state }));
      }
    },

    rehydrate: (codeKeys) => {
      for (const codeKey of codeKeys) {
        const storageValue = localStorage.getItem(`code:${codeKey}`);

        if (storageValue) {
          const { state } = JSON.parse(storageValue) as { state: CodeMetaJson };

          set(({ code }) => ({ code: addToLookup({
            key: codeKey,
            current: state.current,
            original: (initialCode as any)[codeKey] || '',
            persist: state.persist,
            updateEditorAt: Date.now(),
          }, code) }));

        } else {
          set(({ code }) => ({ code: addToLookup({
            key: codeKey,
            current: (initialCode as any)[codeKey] || '',
            original: (initialCode as any)[codeKey] || '',
            persist: true,
            updateEditorAt: Date.now(),
          }, code) }));
        }
      }
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
 