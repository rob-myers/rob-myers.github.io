import SearchInstance from "./search/search-instance";
import Mesh, { MeshJson } from "./structs/mesh";
import Point from "./structs/point";

export function findNavPath(
  meshJson: MeshJson,
  start: { x: number; y: number },
  goal: { x: number; y: number },
  verbose = false,
) {
  const m = new Mesh(meshJson);
  const si = new SearchInstance(m);
  si.verbose = verbose;
  si.set_start_goal(
    new Point(start.x, start.y),
    new Point(goal.x, goal.y)
  );
  si.search();
  return si.get_path_points();
}

/**
 * Avoid recreating Mesh.
 */
export function findNavPathAlt(
  mesh: Mesh,
  start: { x: number; y: number },
  goal: { x: number; y: number },
  verbose = false,
) {
  const si = new SearchInstance(mesh);
  si.verbose = verbose;
  si.set_start_goal(
    new Point(start.x, start.y),
    new Point(goal.x, goal.y)
  );
  si.search();
  return si.get_path_points();
}
