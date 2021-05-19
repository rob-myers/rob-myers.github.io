 import create from 'zustand';
 import { devtools } from 'zustand/middleware'
 
 export type State = {
   code: Record<string, string>;
 
   readonly api: {
     saveCode: (codeKey: string, contents: string) => void;
     persist: (codeKey: string) => void;
     rehydrate: () => void;
   };
 }
 
const useStore = create<State>(devtools((set, get) => ({
  code: {},
  
  api: {
    persist: (codeKey) => {
      // TODO
    },

    rehydrate: () => {
      // TODO
    },

    saveCode(codeKey, contents) {
      set(({ code }) => ({ code: { ...code, [codeKey]: contents } }));
    },
  },
 }), 'code'));
 
 const api = useStore.getState().api;
 const useCodeStore = Object.assign(useStore, { api });
 
 export default useCodeStore;
 