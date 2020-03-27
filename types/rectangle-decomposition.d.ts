declare module 'rectangle-decomposition' {

  type Coord = [number, number];
  type Loop = Coord[];

  /** [top-left, bottom-right] */
  type Rect = [Coord, Coord];

  function main(loops: Loop[], clockwise = true): Rect[];

  export default main;

}
