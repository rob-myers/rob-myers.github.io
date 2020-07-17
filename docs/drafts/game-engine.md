# Collaborative Game Engine

Making a decent computer game is difficult.
- The _infrastructure_ is hard: tailored editor, efficient algorithms, precomputed data, scripting etc. 
- The _specifics_ are hard: realistic idea, sticking to it, representing the world, representing the characters, game mechanics etc.

The varied approaches to infrastructure serve to isolate any two distinct game engines.

### Our approach to infrastructure

- `react`
- `scss`
- `typescript`
- `css-modules`
- `redux`
- `react-redux`
- `react-refresh`

Non-standard constraints:

- only support file extensions `ts`, `tsx` and `scss`.
- `tsx` can only import other `tsx`; exactly one entrypoint `app.tsx`.

- `ts` can only import from other `ts`; at most one entrypoint `reducer.ts`.

The import restrictions maximise applicability of hot-reloading i.e. `react-refresh`. The two disjoint rooted dags will be connected by typing `useSelector` and `useDispatch` from `react-redux`.


### Specifying the specifics

Our approach to Top-Down-View...