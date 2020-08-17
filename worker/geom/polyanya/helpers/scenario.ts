import Point from "../structs/point";

export default class Scenario {
  constructor(
    public bucket: number,
    public xsize: number,
    public ysize: number,
    public start: Point,
    public goal: Point,
    public gridcost: number,
  ) {}
}

export function load_scenarios(jsons: ScenarioJson[]): Scenario[] {
  return jsons.map(({ bucket, xsize, ysize, start, goal, gridcost }) =>
    new Scenario(
      bucket,
      xsize,
      ysize,
      new Point(start.x, start.y),
      new Point(goal.x, goal.y),
      gridcost,
    )
  );
}

export interface ScenarioJson {
  bucket: number;
  xsize: number;
  ysize: number;
  start: { x: number; y: number };
  goal: { x: number; y: number };
  gridcost: number;
}
