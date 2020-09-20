import SearchInstance from "./search/search-instance";
import { ScenarioJson, load_scenario } from "./helpers/scenario";
import Mesh, { MeshJson } from "./structs/mesh";

export function findNavPath(meshJson: MeshJson, scenarioJson: ScenarioJson, verbose?: boolean) {
  const m = new Mesh(meshJson);
  const si = new SearchInstance(m);
  si.verbose = verbose || false;
  
  const scen = load_scenario(scenarioJson);

  si.set_start_goal(scen.start, scen.goal);
  si.search();

  // if (verbose) {// TODO understand
  //   console.log('Search nodes', si.getSearchNodes());
  // }

  return si.get_path_points();
}
