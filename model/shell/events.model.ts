export interface NavmeshClick {
  key: 'nav-click';
  x: number;
  y: number;
}

export type WorldEvent = (
  | NavmeshClick
);
